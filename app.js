var Mode = {
    waiting: 0,
    acceleration: 1,
    constant: 2,
    deceleration: 3,
    result: 4
};
var mode = Mode.waiting;

var nameList = [];
var probabilityList = [];
var colorList = [];
var speed = 0.0;
var theta = 0.0;
var len = 0;
var resultDisplayed = false;

const COLOR_ADJ = 0.4;
const RADIUS = 100;
const ACCEL = 0.01; //加速時の加速度
const DECEL = 0.01; //減速時の加速度
const MAX_SPEED = 1.0; //最大速度
const DECEL_RAND_LEVEL = 10; //減速の乱数の幅を設定
const DECEL_RAND_MAGNITUDE = 0.001; //減速の乱数の影響力を設定
const TRIANGLE_SIZE = 10;
const MARGIN = 10;




var holding = false;

function getRandomInt(min, max) {
  return min+Math.floor(Math.random() * Math.floor(max-min));
}

function preload(){
    
}

function setup(){
    var canvas = createCanvas(600,400);
    canvas.parent('canvas');
    textSize(20);
    stroke(0,0,0);
    fill(0,0,0);
    background(255,255,255);
    recalculate();
    dataFetch();
}

function mousePressed(){
    holding = true;
    
}

function mouseReleased() {
    holding = false;

}

function touchStarted(){
    mousePressed();
}

function touchEnded(){
    mouseReleased();
}

//設定欄のカラー設定
function cssColorSet(){
    var counter = 0;
    $('.color-indicator').each(function(){
        push();
        colorMode(HSL, 255);
        var c = color(colorList[counter],255-COLOR_ADJ*colorList[counter],128);
        pop();
        $(this).css('background-color', "rgb("+c._getRed()+","+c._getGreen()+","+c._getBlue()+")");
        counter++;
    });
}


//フォーム内容の取得
function dataFetch(){
    var ratioSum = 0.0;
    $('.item').each(function(){
        var ratio = $(this).find('.ratio').val()-0;
        ratioSum += ratio;
    });
    nameList = [];
    probabilityList = [];
    $('.item').each(function(){
        var name = $(this).find('.name').val();
        var ratio = $(this).find('.ratio').val()-0;
        nameList.push(name);
        probabilityList.push(ratio/ratioSum);
    });
    //ルーレットの色設定
    var colors = [];
    len = nameList.length;
    for(var i=0;i<len;i++){
        colors.push(Math.floor(255/len*i));
    }
    colorList = [];
    if(len%2==0){
        for(var i=0;i<len;i+=2){
            colorList[i] = colors[Math.floor(i/2)];
        }
        for(var i=1;i<len;i+=2){
            colorList[i] = colors[Math.floor(i/2 + len/2)];
        }
    }else{
        for(var i=0;i<len;i+=2){
            colorList[i] = colors[Math.floor(i/2)];
        }
        for(var i=1;i<len;i+=2){
            colorList[i] = colors[Math.floor(i/2)+Math.floor(len/2)+1];
        }
    }
cssColorSet();//後述
}


//入力値が妥当かの検証する関数
function validation(){
    var badflag = false;
    //項目名が空欄ではないかの確認
    $('.name').each(function(){
        if($(this).val()==""){
            badflag = true;
        }
    });
    //割合が0より大きいかの確認　後で消したい
    $('.ratio').each(function(){
        if(!($(this).val()>=0)){
            badflag = true;
        }
    });
    if(badflag){
        alert('項目名と割合を正しく設定してください。');
        return 1;
    }
    return 0;
}

//スタートボタン
function start(){
    if(mode==Mode.waiting){
        if(validation()==1){
            return;
        }
        $('#stop').css('display', 'inline-block');
        $('#start').css('display', 'none');
        dataFetch();
        mode = Mode.acceleration;
    }
}
//ストップボタン
function stop(){
    if(//mode==Mode.acceleration || //加速中でもストップボタンを効かせるにはコメントアウトを解除
       mode==Mode.constant){
        $('#start').css('display', 'none');
        $('#stop').css('display', 'none');
        mode = Mode.deceleration;
    }
}
//リセットボタン
function reset(){
    $('#start').css('display', 'inline-block');
    $('#stop').css('display', 'none');
    theta = 0.0;
    speed = 0.0;
    mode = Mode.waiting;
    if(validation()==0){
        dataFetch();
    }
    $('#result').html('????');
    resultDisplayed = false;
}

//ルーレットの画面面積の設定
function drawRoulette(){
    var angleSum = 0.0;
    push();
    colorMode(HSL, 255);
    for(var i=0;i<len;i++){
        fill(colorList[i],255-COLOR_ADJ*colorList[i],128);
        arc(0,0,RADIUS*2,RADIUS*2,angleSum,angleSum+2*PI*probabilityList[i]);
        angleSum += probabilityList[i]*2*PI;
    }
    pop();
}


function draw(){
    fill(255,255,255); //背景を白で塗りつぶし
    rect(0,0,width,height);  //描画 canvasのサイズと同じ
    translate(width/2, height/2);  //中心の設定

    //矢印の描画
    fill(255,0,0);
    push();
    translate(0, -RADIUS-MARGIN);
    triangle(0, 0, -TRIANGLE_SIZE/2, -TRIANGLE_SIZE, TRIANGLE_SIZE/2, -TRIANGLE_SIZE);
    pop();

    //シークレットボタン用変数 
    let cheatname = document.getElementById("secret_input").value;
    
    switch(mode){
        case Mode.waiting:  //待機 回転なしで描画
        break;

        case Mode.acceleration:  //加速中  
            if(speed<MAX_SPEED){
                speed += ACCEL;
            }else{
                mode = Mode.constant;
                speed = MAX_SPEED;
            }
            theta += speed;
            theta-=(Math.floor(theta/2/PI))*2*PI;
            rotate(theta);
            break;
        case Mode.constant:    //定速
            theta += speed;
            theta-=(Math.floor(theta/2/PI))*2*PI;
            rotate(theta);
            break;
        case Mode.deceleration:   //減速
            if(speed>DECEL){
                speed -= DECEL+getRandomInt(-DECEL_RAND_LEVEL,DECEL_RAND_LEVEL)*DECEL_RAND_MAGNITUDE;
            }else{
                speed = 0.0;
                mode = Mode.result;
            }
            theta += speed;
            theta-=(Math.floor(theta/2/PI))*2*PI;
            rotate(theta);
            break;
        case Mode.result:     //結果
        rotate(theta);
            if(!resultDisplayed){
                resultDisplayed = true;
                var angleSum = theta;
                var beforeAngleSum = theta;
                var result = 0;
                for(var i=0;i<len;i++){
                    angleSum += probabilityList[i]*2*PI;
                    if((angleSum>3/2*PI&&beforeAngleSum<3/2*PI) || (angleSum>7/2*PI&&beforeAngleSum<7/2*PI)){
                        result = i;
                        break;
                    }
                    beforeAngleSum = angleSum;
                }
                //secret_inputに値があれば、その値を表示  なければルーレット通り
                if(cheatname != ""){
                    $('#result').html(document.getElementById("secret_input").value);
                }else{
                    $('#result').html(nameList[result]);
                }
            }
            break;
    }
    drawRoulette();
    
}

