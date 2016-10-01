/// <reference path="../typings/angularjs/angular.d.ts" />

interface IGithubUser {
    FirstName: string;
    LastName: string;
    GithubLogin: string;
}

interface IGithubUsersCollection {
    Members: IGithubUser[];
    Mentors: IGithubUser[];
}

interface IAppScope extends angular.IScope {
    yourName: string;
    GithubUsers: IGithubUsersCollection;
    WebhubNinjas: any;

    ShowMembers(): void;

    // ToDo: Move to a service
    LoadGithubAccounts(): void;
    LoadWebhubNinjas(): void;
}

var AppScope: IAppScope;

angular.module("DojoWebApp", [])
    .controller("DojoWebController", [
        "$scope",
        function (scope: IAppScope) {
            AppScope = scope;

            scope.yourName = "Dude Awesome";

            // If the modal is in the url - open it
            if (location.hash) {
                var modalId = location.hash.replace("/", "");
                console.log("hash:" + modalId);
                setTimeout(() => {
                    $("[href=" + modalId + "]").trigger("click");
                }, 100);
            }

            scope.ShowMembers = () => {
                scope.LoadGithubAccounts();
            };

            scope.LoadWebhubNinjas = (): void => {
                $.ajax("http://webhub.coderdojoennis.com/ninja-list.php")
                    .done((data) => {
                        scope.WebhubNinjas = data;
                        scope.$apply();
                    });
            };

            scope.LoadGithubAccounts = (): void => {
                console.log("AJAX CALL");
                $.ajax("http://member.coderdojoennis.com/api/githubaccounts")
                    .done((data) => {
                        scope.GithubUsers = data;
                        scope.$apply();
                    });
            };

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
