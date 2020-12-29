export SUPERSET=superset
export STACK_CURRENT=stk1
export STACK_RECYCLE=stk2
export PLAYER_DIR=players
export PLAYER_CARD_JSONDIR=playersjson
# export PLAYER_COUNT=3

if [ $1 = "npminstall" ]; then
    npm install socket.io shelljs log-timestamp
fi

if [ $1 = "superinit" ]; then
    echo "超级管理员重新开始了游戏！">>log.txt
    rm -rf $PLAYER_DIR
    rm $STACK_RECYCLE
    shuf $SUPERSET > $STACK_CURRENT
fi

if [ $1 = "takeone" ]; then # $2 is player id
    echo "玩家 $2 抽取了一张牌">>log.txt
    mkdir -p $PLAYER_DIR
    head -n 1 $STACK_CURRENT >> $PLAYER_DIR/$2
    sed -i 1d $STACK_CURRENT
fi

if [ $1 = "takefromrecycle" ]; then
    # $2 takes $3 card
    echo "玩家 $2 从垃圾桶里捡了一张 $3">>log.txt
    grep $3 $STACK_RECYCLE|head -n1>>$PLAYER_DIR/$2
    sed -i "0,/$3/{/$3/d}" $STACK_RECYCLE
fi

if [ $1 = "peekone" ]; then
    head -n 1 $STACK_CURRENT
fi

if [ $1 = "put" ]; then # $2 puts $3 card into recycle
    echo "玩家 $2 使用了一张 $3">>log.txt
    grep $3 $PLAYER_DIR/$2|head -n1>>$STACK_RECYCLE
    sed -i "0,/$3/{/$3/d}" $PLAYER_DIR/$2
fi

if [ $1 = "stackmerge" ]; then
    echo "有人把弃牌堆和剩下的牌洗了一遍">>log.txt
    cat $STACK_CURRENT $STACK_RECYCLE>/tmp/$STACK_CURRENT
    rm $STACK_RECYCLE
    cat /tmp/$STACK_CURRENT|shuf>$STACK_CURRENT
fi  

if [ $1 = "getcards" ]; then
    python3 <<!
import os,json
retval={}
try:
    for file in os.listdir("$PLAYER_DIR"):
        with open(os.path.join("$PLAYER_DIR", file)) as f:
            retval[file]=[i.strip() for i in f.readlines()]
except: pass
print(json.dumps(retval))
!
fi

if [ $1 = "getlog" ]; then
    tail -n 10 log.txt|tac
fi

if [ $1 = "rmlog" ]; then
    echo "日志被清空了！！！"> log.txt
fi

if [ $1 = "addlog" ]; then
    echo $2>> log.txt
fi
