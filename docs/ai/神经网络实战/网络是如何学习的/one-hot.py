# one-hot编码
import numpy as np                          # 导入 NumPy 库，并简写为 np

def one_hot_encoding(raw, num):             # 定义函数 one_hot_encoding，参数 raw 是原始标签数组，num 是类别总数
    result = []                             # 初始化一个空列表，用于存放每个标签转换后的 one-hot 向量
    for ele in raw:                         # 遍历原始标签数组中的每一个标签值 ele
        arr = np.zeros(num)                 # 创建一个长度为 num 的全零一维数组 arr
        np.put(arr, ele, 1)                 # 将 arr 中索引为 ele 的位置的值改为 1，实现该标签的 one-hot 编码
        result.append(arr)                  # 把生成的 one-hot 向量添加到结果列表 result 中

    return np.array(result)                 # 将结果列表转换为 NumPy 数组并返回

digits = np.array([5, 3, 7, 4])             # 创建原始标签数组 digits，包含 4 个标签：5、3、7、4
one_hot = one_hot_encoding(digits, 8)      # 调用 one_hot_encoding 函数，类别总数为 8，得到 one-hot 编码结果
print('代转换标签数组：', digits)             # 打印原始标签数组（原文“代转换”应为“待转换”）
print('独立热编码后：', one_hot)              # 打印 one-hot 编码后的数组（原文“独立热编码”通常称“独热编码”）