import struct  # 导入 struct 模块，用于处理二进制数据
import matplotlib.pyplot as plt  # 导入 matplotlib 
import numpy as np  # 导入 numpy 库，用于数组和矩阵运算

import tensorflow as tf

"""
dateMat = np.ones((7,7))  # 创建一个 7×7 的全 1 矩阵，作为输入数据
kernel = np.array([[2,1,1],[3,0,1],[1,1,0]])  # 定义 3×3 的卷积核

def convolve(dateMat, kernel):  # 定义二维卷积函数，参数为输入矩阵 dateMat 和卷积核 kernel
    m, n = dateMat.shape  # 获取输入矩阵的行数 m 和列数 n
    km, kn = kernel.shape  # 获取卷积核的行数 km 和列数 kn
    newMat = np.ones(((m-km+1),(n-kn+1)))  # 初始化输出矩阵，大小为 (m-km+1)×(n-kn+1)，先用 1 填充（后续会被覆盖）
    tempMat = np.ones((km,kn))  # 初始化临时矩阵，用于暂存逐元素乘积，大小与卷积核相同

    for row in range(m-km+1):  # 遍历输出矩阵的每一行
        for col in range(n-kn+1):  # 遍历输出矩阵的每一列
            for m_k in range(km):  # 遍历卷积核的每一行
                for n_k in range(kn):  # 遍历卷积核的每一列
                    tempMat[m_k,n_k] = dateMat[(row+m_k),(col+n_k)] * kernel[m_k,n_k]  # 计算输入局部区域与卷积核对应元素的乘积，存入临时矩阵
            newMat[row,col] = np.sum(tempMat)  # 将临时矩阵所有元素求和，作为当前输出位置的值

    return newMat  # 返回卷积结果矩阵
"""
# 创建一个可训练变量作为输入
# 形状为 [batch, height, width, channels] = [1, 3, 3, 1]
# 表示：1 张图片，高 3，宽 3，1 个通道（灰度图）
input = tf.Variable(tf.random.normal([1, 3, 3, 1]))

# 定义一个二维卷积层
# Conv2D(filters=1, kernel_size=2)
# filters=1：输出 1 个特征图（1 个卷积核）
# kernel_size=2：卷积核大小为 2×2
# 默认 stride=1，padding='valid'，所以不补零
conv = tf.keras.layers.Conv2D(1, 2)(input)
# 打印卷积结果
print(conv)
