template.js
===========

JavaScript前端轻量级模板引擎

这是一个将JSON数据填充到定制模板中的小工具，符合AMD加载器标准，也可单独使用。

该说明由两部分构成：1）模板标记，2）委托函数。

================
### 1、模板标记

模板标记有一对大括弧及内夹的非空字符组成，对应的正则表达式可能更清楚些（如果你懂正则）：

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

特别说明一下：template-invoker对外部委托方法的查找，是基于namespace的。例如，你可以定义一个函数库封装所有的相关委托，在替换模板时将该库制定给replace函数，那么所有的委托方法都将在这个库内进行查找。不指定时，查找域则从window开始。例如：

    //HTML
    <img id="temp-img" template-invoker="img" />


    //JS
    var invoker = {
        img : function(data, node){ ... },
        div : function(data, node){ ... }
    };
    var t = new template('temp-img');
    t.replace(data, invoker);

