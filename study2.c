#include<stdio.h>

int main()
{
	int man = 0, woman = 0, kid = 0;
	for (man = 0; man <= 30; man++)
	{
		for (woman = 0; woman <= 30; woman++)
		{
			kid = 30 - man - woman;
			if (kid >= 0 && man + woman + kid == 30 && 3 * man + 2 * woman + kid == 50) {
				printf("��%d�����ˣ�%d��Ů�ˣ�%d������\n", man, woman, kid);
			}
		}
	}
	return 0;
}