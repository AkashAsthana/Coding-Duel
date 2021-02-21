#include <stdio.h>

#include <iostream>
using namespace std;
int main() {
    cout << "Hello world" << endl;
    int values[5];
    printf("Enter 5 integers: ");
    // taking input and storing it in an array
    for (int i = 0; i < 5; ++i) {
        //scanf("%d", &values[i]);
        values[i] = i;
    }

    printf("Displaying integers: ");

    // printing elements of an array
    for (int i = 0; i < 5; ++i) {
        printf("%d\n", values[i]);
    }
    return 0;
}
