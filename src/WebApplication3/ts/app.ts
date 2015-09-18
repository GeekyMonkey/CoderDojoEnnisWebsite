/// <reference path="../typings/angularjs/angular.d.ts" />

interface IAppScope extends angular.IScope
{
    yourName: string;
}

angular.module('DojoWebApp', [])
    .controller('DojoWebController', [
        "$scope",
        function (scope: IAppScope) {

            scope.yourName = "Dude Awesome";

            // If the modal is in the url - open it
            if (location.hash) {
                var modalId = location.hash.replace('/', '');
                console.log("hash:" + modalId);
                setTimeout(() => {
                    $('[href=' + modalId + ']').trigger("click")
                }, 100);
            }

            /*
                var todoList = this;
                todoList.todos = [
                    { text: 'learn angular', done: true },
                    { text: 'build an angular app', done: false }];
    
                todoList.addTodo = function () {
                    todoList.todos.push({ text: todoList.todoText, done: false });
                    todoList.todoText = '';
                };
    
                todoList.remaining = function () {
                    var count = 0;
                    angular.forEach(todoList.todos, function (todo) {
                        count += todo.done ? 0 : 1;
                    });
                    return count;
                };
    
                todoList.archive = function () {
                    var oldTodos = todoList.todos;
                    todoList.todos = [];
                    angular.forEach(oldTodos, function (todo) {
                        if (!todo.done) todoList.todos.push(todo);
                    });
                };
            */
        }
    ]);
