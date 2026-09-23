import torch
from torch.utils.data import DataLoader
from torchvision import transforms
from torchvision.datasets import MNIST
import matplotlib.pyplot as plt

class Net(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.fcl = torch.nn.Linear(28*28,64)
        self.fcl2 = torch.nn.Linear(64,64)
        self.fcl3 = torch.nn.Linear(64,64)
        self.fcl4 = torch.nn.Linear(64,10)

    #前馈过程
    def forward(self,x):
        x = torch.nn.functional.relu(self.fcl(x))
        x = torch.nn.functional.relu(self.fcl2(x))
        x = torch.nn.functional.relu(self.fcl3(x))
        x = torch.nn.functional.log_softmax(self.fcl4(x),dim=1)

        return x

#导入数据
def get_data_loader(is_train):
    to_tensor = transforms.Compose([transforms.ToTensor()])
    data_set = MNIST("",is_train,transform=to_tensor,download=True)
    return DataLoader(data_set,batch_size=15,shuffle=True)

#评估神经网络识别正确率
def evaluate(test_data,net):
    n_correct = 0
    n_total = 0
    with torch.no_grad():
        for (x,y) in test_data:
            outputs = net.forward(x.view(-1,28*28))
            for i,output in enumerate(outputs):
                if torch.argmax(output) == y[i]:
                    n_correct += 1
                n_total += 1
    return n_correct/n_total

def main():
    train_data = get_data_loader(is_train=True)
    test_data = get_data_loader(is_train=False)
    #初始化神经网络
    net = Net()
    print("初始正确率：",evaluate(test_data,net))

    #训练神经网络固定写法
    optimizer = torch.optim.Adam(net.parameters(),lr=0.001)
    for epoch in range(2):
        for (x,y) in train_data:
            #初始化
            net.zero_grad()
            #正向传播
            output = net.forward(x.view(-1,28*28))
            #计算误差
            loss = torch.nn.functional.nll_loss(output,y)
            #后向传播
            loss.backward()
            #更新参数
            optimizer.step()
        print(f"epoch {epoch+1} 后准确率: {evaluate(test_data, net)}")

    for (n,(x,_)) in enumerate(test_data):
        if n>3:
            break
        predict = torch.argmax(net.forward(x[0].view(-1,28*28)))
        plt.figure(n)
        plt.imshow(x[0].view(28,28))
        plt.title("prediction:"+str(int(predict)))
    plt.show()

if __name__ == "__main__":
    main()