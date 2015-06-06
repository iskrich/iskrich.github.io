;(function () {
    var Game = function (canvasId) {
        var canvas = document.getElementById(canvasId);
        var screen = canvas.getContext('2d');
        this.field=new Field(this);
        var gameSize = {x: canvas.width, y: canvas.height}
        var self = this;
        this.lines = [];
        this.points = CreatePoints(this,screen,this.field);
        this.player = new Player(this,screen,1,this.field);
        var tick = function () {
            self.update(gameSize);
            self.draw(screen, gameSize);
            requestAnimationFrame(tick);
        }

        tick();
    }
    Game.prototype = {

        update: function (gameSize) {
            for (var i = 0; i < this.points.length; i++) {
                this.points[i].update();
            }
            this.player.update();
        },
        draw: function (screen, gameSize)   {
            clearCanvas(screen, gameSize);
            for (var i = 0; i < this.points.length; i++) {
                this.points[i].draw();
            }
            for (var i=0;i<this.lines.length;i++){
                this.lines[i].draw();
            }
        },
        addLine:function(line){
            this.lines.push(line);
        }
    }

    var Point = function (game,screen,position,field,id) {
        this.game  = game;
        this.screen=screen;
        this.selected;
        this.field = field;
        this.id=id;
        this.position = position;

    }
    Point.prototype = {
        update: function(){

        },
        draw: function (){
            drawCircle(this.screen, this,this.selected);
        }
    }

    var Field = function(game){
        this.n=8;
        this.position={x:0,y:0};
        this.size= {width:0,height:0};
        this.game=game;
        this.field=new Array(this.n);
        for (var i=0; i<this.n; i++) {
            this.field[i]=new Array(this.n);
        }
        for (var i=0;i<this.n;i++){
            for (var j=0;j<this.n;j++){
                this.field[i][j] = 0;
            }
        }

    }
    Field.prototype ={
        draw : function(){

        },
        update: function(){

        },
        add: function(i,j,player){
            if (this.field[i][j]==0 && i!=j){
                this.field[i][j]=player;
                this.field[j][i]=player;
                return true;
            }
            return false;
        },
        checkTriangle: function(a,b,player){
            for (var i = 0; i < this.n; i++)
            {
                if (this.field[a][ i] == player)
                {
                    if (this.field[i][b] == player) { return true; }
                }
                if (this.field[b][i] == player)
                {
                    if (this.field[i][a] == player) { return true; }
                }
            }
            return false;
        }
    }

    var Line = function(game,screen,field,p1,p2,player){
        this.game=game;
        this.field=field;
        this.screen=screen;
        this.player=player;
        this.p1=p1;
        this.p2=p2;
    }
    Line.prototype ={
        draw : function(){
            this.screen.beginPath();
            if (this.player==1) {
                this.screen.strokeStyle = "#FF0000";
            }
            else
            {
                this.screen.strokeStyle = "#00FF00";
            }
            this.screen.moveTo(this.p1.x,this.p1.y);
            this.screen.lineTo(this.p2.x,this.p2.y);
            this.screen.lineWidth=5;
            this.screen.stroke();
            this.screen.strokeStyle = "#000000";
            this.screen.lineWidth=1;
        },
        update: function(){
        }
    }

    var Player = function(game,screen,id,field){
        this.firstPoint=-1;
        this.secondPoint=-1;
        this.field=field;
        this.game=game;
        this.screen=screen;
        this.id=id;
        this.mouse= new Mouse();
        this.position = {x:0,y:0};
    }
    Player.prototype = {
        update: function () {
            if (this.mouse.isDown(this.mouse.KEYS.MOUSE_DOWN) && this.mouse.getID()>=0) {
                this.firstPoint = this.mouse.getID();
                this.game.points[this.firstPoint].selected=true;
            }
            if (this.mouse.isDown(this.mouse.KEYS.MOUSE_UP) ) {
                this.game.points[this.firstPoint].selected=false;
                if (this.mouse.getID()>=0){
                this.secondPoint =this.mouse.getID();
                if (this.field.add(this.firstPoint,this.secondPoint,this.id)){
                    console.log(this.firstPoint);
                    console.log(this.secondPoint);
                    this.game.addLine(
                        new Line(this.game,this.screen,this.field,getPositionFromPoint(this.firstPoint),getPositionFromPoint(this.secondPoint),this.id));
                    if (this.field.checkTriangle(this.firstPoint,this.secondPoint,this.id)){
                        alert(this.id + " Player "+" loose ");
                        this.game.points = CreatePoints(this.game,this.screen,this.field);
                        this.game.lines=[];
                        this.game.field=new Field(this.game);
                        this.game.player=new Player(this.game,this.screen,1,this.game.field);
                        document.body.style.backgroundColor="red";
                        return;
                    }
                    document.body.style.backgroundColor = this.id == 1? "green": "red";
                    this.id = this.id == 1? 2:1;
                }
                }
            }
        }
    }

    var Mouse = function(){
        var selected = -1;
        var overed = -1;
        var mouseState = [false,false];
        document.getElementById('area').onmousedown= function(e){
            mouseState[0] = true;
            var canvas = document.getElementById("area");
            var event = {x: e.clientX-=canvas.offsetLeft,y: e.clientY-=canvas.offsetTop};
            selected = getSelected(event);
        }
        document.getElementById('area').onmouseup = function(e){
            mouseState[1] = true;
            var canvas = document.getElementById("area");
            var event = {x: e.clientX-=canvas.offsetLeft,y: e.clientY-=canvas.offsetTop};
            selected = getSelected(event);
        }
        this.isDown = function(keyCode){
            var temp = mouseState[keyCode] ===true
            mouseState[keyCode] =false;
            return temp;
        }
        this.getID = function(){
            return selected;
        }
        this.KEYS = {MOUSE_DOWN:0,MOUSE_UP:1};
    }

    var CreatePoints = function (game,screen,field) {
        var points = [];
        points.push(new Point(game,screen, {x: 400, y: 50 },field,1));
        points.push(new Point(game,screen, {x: 550, y: 100},field,7));
        points.push(new Point(game,screen, {x: 600, y: 250},field,3));
        points.push(new Point(game,screen, {x: 550, y: 400},field,4));
        points.push(new Point(game,screen, {x: 400, y: 450},field,0));
        points.push(new Point(game,screen, {x: 250, y: 400},field,5));
        points.push(new Point(game,screen, {x: 200, y: 250},field,2));
        points.push(new Point(game,screen, {x: 250, y: 100},field,6));


        return points;
    }
    var drawCircle= function(screen,body,selected){
        var i=5;
        if (selected){
            i=10;
        }
        else{
            i=5;
        }
        screen.beginPath();
        screen.arc(body.position.x,body.position.y,i,0,2*Math.PI);
        screen.stroke();
    }
    var clearCanvas= function(screen,gameSize){
        screen.clearRect(0,0,gameSize.x,gameSize.y);
    }
    var getSelected = function(e){
        if ((Math.abs(e.x-400) <10) && ((Math.abs(e.y-50))<10)){
            return 0;
        }
        if ((Math.abs(e.x-550) <10) && ((Math.abs(e.y-100))<10)){
            return 1;
        }
        if ((Math.abs(e.x-600) <10) && ((Math.abs(e.y-250))<10)){
            return 2;
        }
        if ((Math.abs(e.x-550) <10) && ((Math.abs(e.y-400))<10)){
            return 3;
        }
        if ((Math.abs(e.x-400) <10) && ((Math.abs(e.y-450))<10)){
            return 4;
        }
        if ((Math.abs(e.x-250) <10) && ((Math.abs(e.y-400))<10)){
            return 5;
        }
        if ((Math.abs(e.x-200) <10) && ((Math.abs(e.y-250))<10)){
            return 6;
        }
        if ((Math.abs(e.x-250) <10) && ((Math.abs(e.y-100))<10)){
            return 7;
        }
        return -1;
    }
    var getPositionFromPoint = function (point) {
        var POSITIONS = {
            0: {x: 400, y: 50},
            1: {x: 550, y: 100},
            2: {x: 600, y: 250},
            3: {x: 550, y: 400},
            4: {x: 400, y: 450},
            5: {x: 250, y: 400},
            6: {x: 200, y: 250},
            7: {x: 250, y: 100}
        }
        return POSITIONS[point];

    }
    window.onload= function () {
        new Game("area");
    }
})();
