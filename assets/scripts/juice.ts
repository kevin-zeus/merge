const {ccclass, property} = cc._decorator;

const RandomInteger = function (e, t) {
    return Math.floor(Math.random() * (t - e) + e)
}

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.SpriteFrame)
    grain: cc.SpriteFrame = null; // 果粒

    @property(cc.SpriteFrame)
    bead: cc.SpriteFrame = null; // 水珠

    @property(cc.SpriteFrame)
    juice: cc.SpriteFrame = null; // 果汁

    init(data) {
        this.grain = data.grain;
        this.bead = data.bead;
        this.juice = data.juice;
    }

    /**
     * 动画效果
     */
    showJuice(pos: cc.Vec2, width: number) {
        // 果粒
        for (let i = 0; i < 10; ++i) {
            const node = new cc.Node('Sprite');
            const sp = node.addComponent(cc.Sprite);

            sp.spriteFrame = this.grain;
            node.parent = this.node;

            const a = 359 * Math.random(),
                i = 30 * Math.random() + width / 2,
                l = cc.v2(Math.sin(a * Math.PI / 180) * i, Math.cos(a * Math.PI / 180) * i);
            node.scale = .5 * Math.random() + width / 100;
            const p = .5 * Math.random();

            node.x = pos.x;
            node.y = pos.y;
            node.runAction(
                cc.sequence(cc.spawn(cc.moveBy(p, l),
                    cc.scaleTo(p + .5, .3),
                    cc.rotateBy(p + .5, RandomInteger(-360, 360))),
                    cc.fadeOut(.1),
                    cc.callFunc(function () {
                        node.active = false
                    }, this))
            )
        }

        // 水珠
        for (let f = 0; f < 20; f++) {
            const node = new cc.Node('Sprite');
            const sp = node.addComponent(cc.Sprite);

            sp.spriteFrame = this.bead;
            node.parent = this.node;

            let a = 359 * Math.random(), i = 30 * Math.random() + width / 2,
                l = cc.v2(Math.sin(a * Math.PI / 180) * i, Math.cos(a * Math.PI / 180) * i);
            node.scale = .5 * Math.random() + width / 100;
            let p = .5 * Math.random();
            node.x = pos.x;
            node.y = pos.y;
            node.runAction(cc.sequence(cc.spawn(cc.moveBy(p, l), cc.scaleTo(p + .5, .3)), cc.fadeOut(.1), cc.callFunc(function () {
                node.active = false
            }, this)))
        }

        // 果汁
        const node = new cc.Node('Sprite');
        const sp = node.addComponent(cc.Sprite);

        sp.spriteFrame = this.juice;
        node.parent = this.node;

        node.x = pos.x;
            node.y = pos.y;
        node.scale = 0
        node.angle = RandomInteger(0, 360)
        node.runAction(cc.sequence(cc.spawn(cc.scaleTo(.2, width / 150), cc.fadeOut(1)), cc.callFunc(function () {
            node.active = false
        })))
    }
}
