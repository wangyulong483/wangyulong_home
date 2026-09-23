# -*- coding: utf-8 -*-
"""
文件名 : mylstm.py
作用   : 用 LSTM 预测上证指数(sh000001)的「次一交易日最高价」
数据   : 同目录下的 dataset.csv（8727 行日线，字段 index_code,date,open,close,low,high,volume,money,change,label）

整体数据流（先看这条主线，再看每行注释）：
    dataset.csv
      → data (8727 行 × 8 列)
      → 按训练段求 mean/std 做标准化
      → 滑动窗口切成 (样本数, time_step=20, 7 个特征)
      → input_fc 升维 → LSTM 提取时序 → output_fc 降成 1 维
      → 输出形状 (batch, 20, 1)，即"每一步的次高预测"
      → 反归一化 → 与真实值比对，算相对误差和 R²
"""
import os                                                         # 路径工具：把 "dataset.csv" 定位到脚本所在目录（本次报错的修复点）
import pandas as pd                                               # 读 csv、做表格处理
import numpy as np                                                # 数值计算：求均值/标准差、数组切片
import matplotlib.pyplot as plt                                   # 画 "预测值 vs 真实值" 折线图
import torch                                                      # PyTorch 主库：张量 + 自动求导
import torch.nn as nn                                             # 网络层：Linear / LSTM / MSELoss
from torch.utils.data import Dataset, DataLoader, random_split    # 数据集基类 / 批次加载器 / 随机划分工具
from sklearn.metrics import r2_score                              # 决定系数 R²，衡量回归拟合优度（越接近 1 越好）

# ==================== 0. 路径与随机种子 ====================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))             # __file__ 是本脚本路径 → abspath 转绝对路径 → dirname 取所在文件夹（.../ai/RNN）
DATA_PATH = os.path.join(BASE_DIR, 'dataset.csv')                 # 用绝对路径拼出 csv，无论从哪个目录运行 python 都能找到
MODEL_DIR = os.path.join(BASE_DIR, 'model')                       # 模型保存目录，同样锚定到脚本目录
BEST_MODEL_PATH = os.path.join(MODEL_DIR, 'best_model.pth')       # 验证集最优权重的落盘路径
os.makedirs(MODEL_DIR, exist_ok=True)                             # 目录不存在就创建（exist_ok=True 表示已存在也不报错）
torch.manual_seed(42)                                             # 固定 torch 随机种子 → 权重初始化、random_split 每次一致
np.random.seed(42)                                                # 固定 numpy 随机种子 → 结果可复现

DEBUG = True                                                      # True 时打印中间张量的形状/统计量，方便观察数据流动

def log(*args):                                                   # 自定义日志函数：统一加 [LOG] 前缀
    if DEBUG:                                                     # 只在 DEBUG 打开时输出
        print('[LOG]', *args)                                     # 打印内容

# ==================== 1. 超参数 ====================
run_unit = 20                  # LSTM 隐藏层维度（注意：原书此处拼写为 run_unit，实为 rnn_unit，保持原样以便对照书本）
lstm_layers = 2                # LSTM 堆叠层数，两层可以学到更抽象的时序特征
input_size = 7                 # 每个时间步的输入特征数：open, close, low, high, volume, money, change
output_size = 1                # 每个时间步输出 1 个数：次一交易日最高价
lr = 0.0001                    # 学习率，Adam 优化器的步长
batch_size = 128               # 每批喂 128 个样本，再更新一次参数
time_step = 20                 # 看过去 20 个交易日，去预测这 20 天每一天对应的"次日最高价"
train_begin = 0                # 训练数据起始行（0 表示从最早的 1990/12/21 开始）
train_end = 5800               # 训练数据结束行；5800 之后（约 2014 年至今）留作测试集
epochs = 100                   # 全量数据训练 100 轮
val_split = 0.2                # 从训练段里再切 20% 出来做验证集（用于选最优模型）

# ==================== 2. 导入数据 ====================
df = pd.read_csv(DATA_PATH)                                       # 读入 csv（绝对路径）；此处原为 r'dataset.csv'，是本次 FileNotFoundError 的根因
data = df.iloc[:, 2:10].values                                    # 取第 2~9 列 → [open, close, low, high, volume, money, change, label]，转成 numpy 数组 (8727, 8)
log('data.shape =', data.shape)                                   # 日志：确认是 (8727, 8)，列数不对后面会连环报错
log('前3行前3列 =\n', data[:3, :3])                                # 日志：抽查数据读入是否正确（应为 109.07 / 113.57 ...）

# ==================== 3. 构建数据集 ====================
class StockDataset(Dataset):                                      # 继承 Dataset，才能被 DataLoader 自动分批
    def __init__(self, data, time_step, begin=0, end=None):       # begin/end 用来圈定训练段，避免验证集泄露统计量
        data_train = data[begin:end] if end is not None else data[begin:]   # 按行切片取训练段（原写法 data[begin,end] 是两个标量索引，会直接报越界）
        self.mean = np.mean(data_train, axis=0)                   # 逐列求均值，shape (8,)，用于标准化
        self.std = np.std(data_train, axis=0)                     # 逐列求标准差，shape (8,)
        self.normalized_data = (data_train - self.mean) / self.std # 标准化：(x-μ)/σ → 均值 0、方差 1，让 LSTM 更容易收敛

        self.X, self.Y = [], []                                   # 装输入序列和标签序列的空列表
        log('normalized_data.shape =', self.normalized_data.shape) # 日志：训练段标准化后的形状

        for i in range(len(self.normalized_data) - time_step):    # 滑动窗口：窗口长 20，最多滑动到"还剩 20 行"的位置
            x = self.normalized_data[i:i + time_step, :7]         # 取窗口内 20 行、前 7 列（7 个特征）→ (20, 7)
            y = self.normalized_data[i:i + time_step, 7]          # 取窗口内 20 行、第 7 列（label=次日最高价）→ (20,)
            self.X.append(x)                                      # 收集输入序列
            self.Y.append(y)                                      # 收集对应标签序列

    def __len__(self):                                            # DataLoader 靠它知道数据集有多大
        return len(self.X)                                        # 样本数 = 窗口个数

    def __getitem__(self, idx):                                   # DataLoader 靠它取第 idx 个样本
        return (torch.tensor(self.X[idx], dtype=torch.float32),   # 输入转 float32 张量 (20, 7)
                torch.tensor(self.Y[idx], dtype=torch.float32).unsqueeze(-1))   # 标签转 (20,) 后 unsqueeze(-1) 变 (20,1)，好和模型输出对齐算 loss

# ==================== 4. LSTM 模型 ====================
class LSTMModel(nn.Module):                                       # 继承 nn.Module，才能用 .parameters()/.to(device)/.train()
    def __init__(self, input_size, rnn_unit, lstm_layers, output_size):   # 注意形参名 rnn_unit，与外面的 run_unit 对应
        super(LSTMModel, self).__init__()                         # 调用父类构造，注册子模块（必须）
        self.input_fc = nn.Linear(input_size, rnn_unit)           # 输入全连接：7 → 20，先把原始特征升到隐藏维度
        self.lstm = nn.LSTM(input_size=rnn_unit,                  # LSTM 的输入维度 = 20（上一步的输出）
                            hidden_size=rnn_unit,                 # 隐藏状态维度 = 20
                            num_layers=lstm_layers,               # 堆 2 层 LSTM
                            batch_first=True)                     # 输入形状约定为 (batch, seq, feature)，与我们的数据一致
        self.output_fc = nn.Linear(rnn_unit, output_size)         # 输出全连接：20 → 1，把每个时间步的隐藏状态压成一个预测值

    def forward(self, x):                                         # 前向传播：定义数据怎么流过网络
        x = self.input_fc(x)                                      # (batch, 20, 7) → (batch, 20, 20)
        out, _ = self.lstm(x)                                    # LSTM 返回 (输出序列, (h_n, c_n))；这里只关心输出序列 → (batch, 20, 20)
        out = self.output_fc(out)                                # 每个时间步都过一遍全连接 → (batch, 20, 1)
        return out                                                # 返回 (batch, 20, 1)，即"20 天里每一天对应的次日最高价预测"

# ==================== 5. 数据加载与划分 ====================
dataset = StockDataset(data, time_step, train_begin, train_end)   # 只用第 0~5800 行构建（标准化统计量也只来自这段）
val_size = int(len(dataset) * val_split)                          # 验证集大小：约 20%
train_size = len(dataset) - val_size                              # 训练集大小：剩下 80%
train_dataset, val_dataset = random_split(dataset, [train_size, val_size])   # 随机切成两份（种子已固定，结果可复现）
log('数据集总数 / 训练 / 验证 =', len(dataset), train_size, val_size)  # 日志：确认划分数量

train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)    # 训练批加载器：打乱顺序，避免模型记住样本次序
val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)       # 验证批加载器：不需要打乱，顺序无所谓

# ==================== 6. 模型、优化器、损失函数 ====================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")   # 有 GPU 用 GPU，没有就用 CPU
log('device =', device)                                                 # 日志：确认跑在什么设备上
model = LSTMModel(input_size, run_unit, lstm_layers, output_size).to(device)   # 实例化模型并搬到设备上
criterion = nn.MSELoss()                                                # 损失函数：均方误差，回归任务的标准选择
optimizer = torch.optim.Adam(model.parameters(), lr=lr)                 # Adam 优化器，负责更新全部可学习参数

# ==================== 7. 训练循环 ====================
best_val_loss = float('inf')                                      # 记录历史最优验证损失，初始设为正无穷（任何值都比它好）
best_model_path = BEST_MODEL_PATH                                 # 最优权重的保存路径（已锚定到脚本目录并预先建好文件夹）

for epoch in range(epochs):                                       # 外层循环：跑 epochs 轮
    model.train()                                                 # 切换训练模式（启用 dropout 等；本例无 dropout，但习惯要养成）
    epoch_loss = 0                                                # 累计本轮所有批次的损失
    for batch_x, batch_y in train_loader:                         # 内层循环：逐批取数据
        batch_x, batch_y = batch_x.to(device), batch_y.to(device) # 把这一批数据也搬到同一设备，否则会报设备不一致
        optimizer.zero_grad()                                     # 清空上一轮的梯度（PyTorch 默认会累加，不清就错了）
        output = model(batch_x)                                   # 前向传播 → (128, 20, 1)
        loss = criterion(output, batch_y)                         # 与真实标签 (128, 20, 1) 算 MSE
        loss.backward()                                           # 反向传播：自动求每层梯度
        optimizer.step()                                          # 按梯度更新参数
        epoch_loss += loss.item()                                 # .item() 把 0 维张量转成 python 浮点数，累加统计
    train_loss = epoch_loss / len(train_loader)                   # 平均每批的损失 = 本轮训练损失
    log(f'epoch {epoch+1} 训练完成，train_loss={train_loss:.6f}')  # 日志：每轮训练结束记录一次

    model.eval()                                                  # 切换评估模式（关掉 dropout/BN 的训练行为）
    val_loss = 0                                                  # 累计验证损失
    with torch.no_grad():                                         # 验证不需要梯度，关闭可省显存、提速
        for batch_x, batch_y in val_loader:                       # 逐批跑验证集
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)   # 同样要搬设备
            output = model(batch_x)                               # 前向传播
            loss = criterion(output, batch_y)                     # 算 MSE
            val_loss += loss.item()                               # 累加
    val_loss /= len(val_loader)                                   # 平均验证损失

    if val_loss < best_val_loss:                                  # 只要比历史最优还好
        best_val_loss = val_loss                                  # 就更新最优记录
        torch.save(model.state_dict(), best_model_path)           # 并把当前权重存盘（只存参数，不存网络结构）
        log(f'  ↑ 保存最优模型，best_val_loss={best_val_loss:.6f}') # 日志：记录保存动作

    print(f"Epoch {epoch+1}/{epochs}\tTrain loss {train_loss:.6f}\t Val loss {val_loss:.6f}")   # 打印进度（原来写成 {epoch}，第 1 轮会显示 "1/0"，已修正为 {epochs}）

# ==================== 8. 测试与预测 ====================
def prediction(time_step=20):                                     # 用训练段之外的 5800 行以后的数据做测试
    data_test = data[train_end:]                                  # 取出测试段原始数据 (2927, 8)
    mean = np.mean(data_test, axis=0)                             # 测试段的逐列均值（注意：这里用了测试集自身的统计量，属于原文写法）
    std = np.std(data_test, axis=0)                               # 测试段的逐列标准差
    normalized_test_data = (data_test - mean) / std               # 标准化，和训练时同口径

    size = (len(normalized_test_data) + time_step - 1) // time_step   # 向上取整算需要多少个长度 20 的窗口
    test_x, test_y = [], []                                       # 装测试输入和测试标签
    for i in range(size - 1):                                     # 前 size-1 个都是完整窗口
        x = normalized_test_data[i*time_step:(i+1)*time_step, :7] # 取 20 行 × 7 特征（原写法把逗号写成了冒号：[a:b:7] 是步长切片，会切出错误形状）
        y = normalized_test_data[i*time_step:(i+1)*time_step, 7]  # 取 20 行的 label 列
        test_x.append(x)                                          # 收集输入
        test_y.append(y)                                          # 收集标签
    tail_start = (size - 1) * time_step                           # 最后一段的起点（可能不足 20 天）
    x_last = normalized_test_data[tail_start:, :7]                # 尾部剩余行（不足一个窗口）
    y_last = normalized_test_data[tail_start:, 7]                 # 尾部剩余标签
    if len(x_last) == time_step:                                  # 只有刚好凑满一个窗口才收进来：保证 test_x/test_y 是规整的 3D/2D 数组
        test_x.append(x_last)                                     # 追加尾部窗口
        test_y.append(y_last)                                     # 追加尾部标签
    else:                                                         # 不足 20 天的情况
        log(f'尾部剩余 {len(x_last)} 天，不足 time_step，丢弃（不影响整体评估）')   # 日志说明：直接丢弃，避免数组长度不一致
    log('测试窗口数 =', len(test_x), '每个窗口形状 =', np.array(test_x).shape)   # 日志：确认形状规整

    model.load_state_dict(torch.load(best_model_path, map_location=device))   # 载入训练时保存的最优权重
    model.eval()                                                  # 切评估模式

    test_predict = []                                             # 装所有窗口的预测结果
    with torch.no_grad():                                         # 推理不需要梯度
        for seq in test_x:                                        # 逐个窗口预测
            seq_tensor = torch.tensor(seq[np.newaxis, :, :], dtype=torch.float32).to(device)   # (20,7) → (1,20,7)，补上 batch 维度
            pred = model(seq_tensor).cpu().numpy().reshape(-1)    # 前向 → (1,20,1) → 拉平成 (20,) 再搬到 cpu
            test_predict.extend(pred)                             # 累积结果（预测仍是标准化尺度）
    log('预测点总数 =', len(test_predict))                          # 日志：应等于 窗口数 × 20

    test_y = np.concatenate(test_y) * std[7] + mean[7]            # 标签反归一化：乘 σ 加 μ，还原成"元"的真实价格尺度
    test_predict = np.array(test_predict) * std[7] + mean[7]      # 预测值同样反归一化（std[7]/mean[7] 对应 label 那一列）

    mean_rel_error = np.mean(np.abs(test_predict - test_y) / test_y) * 100   # 平均相对误差：|预测-真实|/真实 的平均值，单位 %
    r2 = r2_score(test_y, test_predict)                           # R²：1 表示完美拟合，0 表示和"直接取均值"一样差

    print("Average relative error:{:.2f}%".format(mean_rel_error)) # 打印平均相对误差
    print("R2 score:{:.4f}".format(r2))                           # 打印 R²

    plt.figure()                                                  # 新建画布
    plt.plot(list(range(len(test_predict))), test_predict, label="Predict")   # 画预测曲线
    plt.plot(list(range(len(test_y))), test_y, label="Real")      # 画真实曲线
    plt.legend()                                                  # 显示图例
    plt.show()                                                    # 弹窗展示图片

prediction()                                                      # 函数定义完必须调用才会执行
