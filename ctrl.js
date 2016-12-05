

angular.module('directives', [])
    .directive('dropdown',function(){
        return{
            restrict : 'A',
            scope: true,
            link:function(scope, elem, attr){
                var raw = elem[0];
                elem.bind('scroll',function(){
                    if(raw.scrollTop + raw.offsetHeight >= raw.scrollHeight){
                        console.log('加载请求');
                    }
                })
            }
        }
    })
    .directive('headr',function(){
        return{
            restrict : 'E',
            scope : true,
            template : '<div class="head-container"><div class="content" style="left:{{css.width}}px"><a>TAB1</a><a>TAB2</a><a>TAB3</a><a>TAB4</a><a>TAB5</a><a>TAB6</a><a>TAB7</a><a>TAB8</a></div></div>',
            link:function(scope,elem,attr){
                var list = elem.find('a'),
                    parent = elem.find('div')[1],
                    windowWidth = window.screen.width/2;
                    scope.css = {
                        width : 0
                    };

                console.log(elem.find('div'));
                    
                //点击事件
                for(var i=0, len=list.length; i<len ;i++){
                    list[i].onclick = function(event){
                        var el = event.srcElement;

                        //这个20是多余一点范围必要
                        if(el.offsetLeft+el.offsetWidth > windowWidth+20){
                            scope.css.width = -(el.offsetLeft+el.offsetWidth-windowWidth)+el.offsetWidth/2;
                            if(-scope.css.width + window.screen.width > parent.offsetWidth ){
                                scope.css.width = -(parent.offsetWidth - window.screen.width);
                            }
                            scope.$apply();
                        }else if(scope.css.width < 0){
                            scope.css.width = -(el.offsetLeft+el.offsetWidth-windowWidth) + (-scope.css.width);
                            if(scope.css.width>0){
                                scope.css.width = 0;
                            }
                            scope.$apply();
                        }


                        list.removeClass('actives');
                        angular.element(el).addClass('actives');
                    }
                }

                //滑动
                parent.ontouchcancel = function(event){
                    console.log(event);
                    if(event.touches[0].clientX > windowWidth){
                        scope.css.width += event.touches[0].clientX - windowWidth;
                        if( scope.css.width > 0){
                            scope.css.width  = 0;
                        }
                    }else if(event.touches[0].clientX < windowWidth){
                        scope.css.width += event.touches[0].clientX - windowWidth;
                        if( -scope.css.width > windowWidth){
                            scope.css.width  = -(parent.offsetWidth - window.screen.width);
                        }
                    }
                    scope.$apply();
                }

            }
        }
    })
    .directive('footer',function(){
        return{
            restrice : 'E',
            scope : true,
            template : '<div class="footer-container"><a>TAB1</a><a>TAB2</a><a>TAB3</a><a>TAB4</a></div>',
            link:function(scope,elem,attr){

            }
        }
    });







angular.module('app',['directives'])
    .controller('AppCtrl',function($scope){
        $scope.test = '测试下拉111';
    });











