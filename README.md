template.js
===========

JavaScript前端轻量级模板引擎

这是一个将JSON数据填充到定制模板中的小工具，符合AMD加载器标准，也可单独使用。


关于该项目更多信息请移步：[http://mkjs.net/?cat=7](http://mkjs.net/?cat=7)

================
### 1、模板标记

模板标记由一对大括弧及内夹的非空字符组成：

    \{[(^\}\s]+)\}

在制定模板标记时，个人感觉，在一般的HTML代码中，两个大括号足以与正文区别开。例如：

    <ul>
        <li id="temp-li">
            {title}
            <img src="baseUrl/{img}" />
        </li>
    </ul>

对应的数据可以是一个JSON数据对象（Object）或者一个对象的数组（Array）。其实Object数据是基础，Array只是对模板的重复复制。上述模板，对应的数据应为：

    {
        title : 'newsTitle',
        img : 'imageUrl'
    }
    
或者是一组这样的数据。

==================
### 2、委托函数

当原始的JSON数据需要在替换模板阶段进行二次处理时，可以通过对模板（或者其子节点）定义
    template-invoker
属性，委托一个外部的函数进行复杂替换。例如：

    <li
        id="temp-li"
        template-invoker="list_one"
        >
    </li>
    
然后在在JS中定义该函数：

    function list_one(data, node){
        node.innerHTML = data['title'];
        var img = document.createElement('img');
        img.src = 'baseUrl/' + data['img'];
        node.appendChild(img);
    }

template-invoker对外部委托方法的查找，基于namespace。你可以定义一个函数库，封装所有的相关委托，在替换模板时将该库指定为委托的上下文，那么所有的委托方法都将在这个库内进行查找。不指定时，查找域则从window开始。例如：

    //HTML
    <img id="temp-img" template-invoker="img" />
    <div id="temp-div" template-invoker="invoker.div"></div>


    //JS
    var invoker = {
        img : function(data, node){ ... },
        div : function(data, node){ ... }
    };
    var t = new template('temp-img');
    t.replace(data, invoker);
    //不指定委托上下文
    var t2 = new template('temp-img');
    t2.replace(data);


