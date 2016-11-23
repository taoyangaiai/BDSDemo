# BDSDemo
2016.11.23
项目经验:  
Promise中的error传递  
* 本来采用try catch来捕获  
* 正确方式是.catch(function(err){reject(err)})  
