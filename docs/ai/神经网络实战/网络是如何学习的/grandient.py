#梯度下降法
import numpy as np
import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['SimSun']#字体设置

def L(w):
    return w*w

def dL(w):
    return 2*w

def grandient_descent(w_start,df,lr,epochs):
    w_gd = []
    pre_w = w_start

    for i in range(epochs):
        w = pre_w - lr*df(pre_w)
        w_gd.append(w)
        pre_w = w

    return np.array(w_gd)

w0 = 5
epochs =5
lr = 0.4
w_gd = grandient_descent(w0,dL,lr,epochs)
print(w_gd)

#绘制
t = np.arange(-5.5, 5.5, 0.01)
plt.plot(t, L(t), c='b')
plt.plot(w_gd, L(w_gd), c='r', label='学习率={}'.format(lr))
plt.scatter(w_gd, L(w_gd), c='r')
plt.legend()
plt.savefig("squares1.png",
            bbox_inches ="tight",
            pad_inches = 1,
            transparent = True,
            facecolor ="w",
            edgecolor ='w',
            dpi=300,
            orientation ='landscape')

