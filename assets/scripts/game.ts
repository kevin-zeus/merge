const {ccclass, property} = cc._decorator;

const Fruit = cc.Class({
    name: 'FruitItem',
    properties: {
        id: 0, // 水果类型
        iconSF: cc.SpriteFrame, // 贴图资源
    }
})

const JuiceItem = cc.Class({
    name: 'JuiceItem',
    properties: {
        grain: cc.SpriteFrame, // 果粒
        bead: cc.SpriteFrame, // 水珠
        juice: cc.SpriteFrame, // 果汁
    }
});

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    fruitPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    juicePrefab: cc.Prefab = null;

    @property(Fruit)
    fruits = [];

    @property(JuiceItem)
    juices = [];

    @property(cc.AudioClip)
    boomAudio: cc.AudioClip = null;

    @property(cc.AudioClip)
    knockAudio: cc.AudioClip = null;

    @property(cc.AudioClip)
    waterAudio: cc.AudioClip = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Button)
    fingerBtn: cc.Button = null;

    @property
    speed: number = 0; // 移动系数

    // 水果总数
    fruitCount = 0;
    // 当前水果
    currentFruit: cc.Node = null;
    // 是否正在创建水果
    isCreating = false;
    // 份数
    score = 0;
    useFinger = false;
    // 手指按下时的水平线上位置
    touchX = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initPhysics();

        // 监听点击事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        // 刚开始创建一个水果
        this.initOneFruit(1);
    }

    // update (dt) {}

    /**
     * 开启物理引擎和碰撞检测
     */
    initPhysics() {
        // 物理引擎
        const manager = cc.director.getPhysicsManager();
        manager.enabled = true;
        manager.gravity = cc.v2(0, -960);

        // 碰撞检测
        const collisionManager = cc.director.getCollisionManager();
        collisionManager.enabled = true;
        // 显示包围盒
        collisionManager.enabledDebugDraw = true;
        collisionManager.enabledDrawBoundingBox = true;
    }

    onTouchStart(event) {
        if (!this.currentFruit) return;
        this.touchX = event.getLocation().x;
    }

    onTouchMove(event) {
        if (!this.currentFruit) return;
        // 移动过程中的x位置
        const x = event.getLocation().x;
        // 获取移动的偏移位置
        let moveX = (x - this.touchX) * this.speed;

        // 判断移动位置是否超出屏幕范围
        let toX = this.currentFruit.x + moveX;
        if (toX >= this.node.width/2) {
            toX = this.node.width/2 - this.currentFruit.width/2;
        }
        if (toX <= -this.node.width/2) {
            toX = -this.node.width/2 + this.currentFruit.width/2;
        }

        // 通过设置定位来移动
        this.currentFruit.x = toX;
        this.touchX = x;
    }

    onTouchEnd() {
        if (!this.currentFruit) return;

        // 开启水果的物理效果，使其落下
        this.startFruitPhysics(this.currentFruit);
        this.currentFruit = null;
        // 1s后重新生成一个水果
        this.scheduleOnce(() => {
            const nextId = this.getNextFruitId();
            this.initOneFruit(nextId);
        }, 1);
    }

    /**
     * 初始化一个水果
     * @param id 水果id
     */
    initOneFruit(id = 1) {
        if (this.currentFruit) return;
        this.fruitCount++;
        this.currentFruit = this.createFruitOnPos(0, 400, id);
    }

    // 获取下一个水果的id
    getNextFruitId() {
        if (this.fruitCount < 3) {
            return 1;
        } else if (this.fruitCount === 3) {
            return 2;
        } else {
            // 随机返回前5个
            return Math.floor(Math.random() * 5) + 1;
        }
    }

    /**
     * 在指定位置生成水果
     */
    createFruitOnPos(x, y, id = 1) {
        const fruit = this.createOneFruit(id);
        fruit.setPosition(cc.v2(x, y));
        return fruit;
    }

    /**
     * 创建一个水果
     * @param num 水果id
     */
    createOneFruit(num: number) {
        console.log('生成水果')
        let fruit = cc.instantiate(this.fruitPrefab);
        // 获取水果配置信息
        const config = this.fruits[num - 1];
        // 获取节点的水果组件
        fruit.getComponent('fruit').init({
            id: config.id,
            iconSF: config.iconSF
        });
        fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static
        fruit.getComponent(cc.PhysicsCircleCollider).radius = 0

        this.node.addChild(fruit);
        fruit.scale = 0.68;

        fruit.on('sameContact', this.onSameFruitContact.bind(this))

        return fruit;
    }

    startFruitPhysics(fruit: cc.Node) {
        fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
        const PhysicsCircleCollider = fruit.getComponent(cc.PhysicsCircleCollider);
        PhysicsCircleCollider.radius = fruit.height / 2;
        PhysicsCircleCollider.apply();
    }

    /**
     * 两个水果碰撞
     */
    onSameFruitContact(params) {
        const self: cc.Component = params.self;
        const other: cc.Component = params.other;

        other.node.off('sameContact');

        const {x, y} = other.node // 获取合并的水果位置
        const id = other.getComponent('fruit').id
        const nextId = parseInt(id) + 1

        self.node.removeFromParent(true)
        other.node.removeFromParent(true)

        if (nextId <= 11) {
            const newFruit = this.createFruitOnPos(x, y, nextId) // 在指定位置生成新的水果
            this.startFruitPhysics(newFruit)
        }

        this.addScore(id);
        this.createFruitJuice(id, cc.v2(x, y), other.node.width);
    }

    /**
     * 合并时动画效果和音效
     * @param id 
     * @param pos 
     * @param n 
     */
    createFruitJuice(id, pos, n) {
        cc.audioEngine.play(this.boomAudio, false, 0.3);
        cc.audioEngine.play(this.waterAudio, false, 1);

        let juice = cc.instantiate(this.juicePrefab);
        this.node.addChild(juice);

        const config = this.juices[id - 1];
        const juiceInstance = juice.getComponent('juice')
        juiceInstance.init(config);
        juiceInstance.showJuice(pos, n);
    }

    // 添加得分分数
    addScore(fruitId) {
        this.score += fruitId * 2;
        this.scoreLabel.string = `${this.score}`;
    }
}
