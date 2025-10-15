#include<stdio.h>

long Thenum(int m);

int main()
{
	int thesum = 0;
	int n;
	
	scanf_s("%d", &n);
	for (int m = 0;; m++) {
		if (m == 0)
		{
			thesum = 1;
		}
		else
		{
			for (int i = 1; i <= m; i++)
			{
				thesum += Thenum(i);

			}
		}
		if (thesum < n) {
			printf("%d是可以的\n", m);
		}
		else {
			break;
		}
	}
	
	return 0;
}

long Thenum(int m) {
	int sum = 1;
	if (m == 0) {
		return 1;
	}
	else {
		for (int i = 1; i <= m; i++) {
			sum *= i;
		}
	}
	return sum;
}