export const aiChapters = [
  {
    id: 'forward-learning',
    tag: 'FOUNDATION',
    title: '网络是如何学习的',
    summary: '把 docs/ai/神经网络实战/网络是如何学习的 中的实验整理成一条可复现的学习路径：编码、归一化、前向传播，再用梯度下降修正参数。',
    points: [
      '输入先经过 one-hot 编码或标准化，避免不同量纲让优化器偏向某一列。',
      '神经元计算 z = w · x + b，再通过激活函数得到 a；误差由损失函数量化。',
      '梯度下降沿着损失下降的方向更新参数，学习率决定每一步的幅度。',
    ],
    source: 'docs/ai/神经网络实战/网络是如何学习的',
  },
  {
    id: 'cnn-practice',
    tag: 'VISION',
    title: '卷积神经网络：从像素到特征',
    summary: '对应 docs/ai/神经网络实战/卷积神经网络：卷积核滑过局部区域，提取边缘与纹理，再交给全连接层完成分类。',
    points: [
      'Conv2d 负责局部感受野，ReLU 引入非线性，MaxPool2d 压缩空间尺寸。',
      '示例 CNN 使用 3→16→32 个通道，最后将特征图展平为分类器输入。',
      'MNIST 原始文件保存在 docs/ai 中，可继续接入真实推理和混淆矩阵。',
    ],
    source: 'docs/ai/神经网络实战/卷积神经网络',
  },
  {
    id: 'lstm-time-series',
    tag: 'SEQUENCE',
    title: 'RNN / LSTM：记住时间上下文',
    summary: '对应 docs/ai/RNN：使用 20 个时间步、7 个特征预测下一时刻，并记录训练与验证损失。',
    points: [
      '训练数据先按列标准化，再用滑动窗口构造 (batch, time, feature) 序列。',
      '两层 LSTM 将隐藏状态传递给每个时间步的 Linear 输出层。',
      '原始实验记录 100 个 epoch 后验证损失 0.005796，测试 R² 达到 0.9841。',
    ],
    source: 'docs/ai/RNN/mylstm.py + log.md',
  },
]
