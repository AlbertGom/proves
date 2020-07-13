package com.example.firstapp

class Users_Functions {
    var users:MutableList<User> = ArrayList()
    fun init_users(){
            users.add(User("1234","Albert","22","Male","photo"))
    }
    fun find(string: String): Int {
        print(string)
        var ret=0
        for(i in users)
            if(i.username == string){
              ret=1
              break
           }
        return ret
    }
}