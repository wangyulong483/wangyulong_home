#特征标准化
import numpy as np

def normalization(raw):
    max_value = max(raw)
    min_value = min(raw)
    norm = [(float(i)-min_value)/(max_value-min_value) for i in raw]
    return norm

x = np.array([255, 128, 45, 0])

print('原始数据:',x)
norm = '归一化后的原始数据:',normalization(x)
print(norm)