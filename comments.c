#include<stdio.h>
void main()
{
    /*single line comment*/
    /*multi line comment
    line 1;
    line 2;
    line 3;
    */
    printf("rana "); /*line ending comment*/
    printf("bhai's ");  /*line ending multiline comment
    line 1;
    line 2;
    line 3;
    */
   printf/*middle single line comment*/("comment parser ");
   printf/*middle multi line comment
   line 1;
   line 2;
   line 3;
   */("in python\n");

   printf("test /*comment inside printf*/program");
}