window.appInsights=window.appInsights||function(ai){
    function f(t){ai[t]=function(){var i=arguments;ai.queue.push(function(){ai[t].apply(ai,i)})}}
    var t=document,r="script",u=t.createElement(r),i;for(u.src=ai.url||"//az416426.vo.msecnd.net/scripts/a/ai.0.js",t.getElementsByTagName(r)[0].parentNode.appendChild(u),ai.cookie=t.cookie,ai.queue=[],i=["Event","Exception","Metric","PageView","Trace"];i.length;)f("track"+i.pop());
    return ai;
}({
    iKey:"0ee63209-e2b0-48f4-86c0-950220939769"
});

appInsights.trackPageView();
