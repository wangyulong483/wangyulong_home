#include<stdio.h>

void Onefun(int n);
void Twofun(int n);
void Trifun(int n);
int main()     //三种乘法口诀表实现
{ 
	int n;
	scanf_s("%d", &n);
	Onefun(n);
	printf("\n");
	Twofun(n);
	printf("\n");
    Trifun(n);

	return 0;
}

void Onefun(int n) {
	for(int i=1;i<=n;i++)
	{
		printf("%d\t", i);
	}
	printf("\n");
	for(int i=1;i<=n;i++)
	{
		printf("-\t");
	}
	printf("\n");
    for(int i=1;i<=n;i++){
	 for(int j=1;j<=n;j++){
		 printf("%d\t", i * j);
	 }
	 printf("\n");
	}
}

void Twofun(int n) {
	for (int i = 1; i <= n; i++)
	{
		printf("%d\t", i);
	}
	printf("\n");
	for (int i = 1; i <= n; i++)
	{
		printf("-\t");
	}
	printf("\n");
	for (int i = 1; i <= n; i++) {
		for (int j = 1; j <= i; j++) {
			printf("%d\t", i * j);
		}
		printf("\n");
	}
}

void Trifun(int n) {
	for (int i = 1; i <= n; i++)
	{
		printf("%d\t", i);
	}
	printf("\n");
	for (int i = 1; i <= n; i++)
	{
		printf("-\t");
	}
	printf("\n");
	for (int i = 1; i <= n; i++)
	{
		for (int j = 1; j <= n; j++)
		{
			if (j < i)
			{
				printf("\t");
			}
			else {
				printf("%d\t", i * j);
			}
		
		}
		printf("\n");
	}
}