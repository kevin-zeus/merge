// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property
    id = 0;

    init(data) {
        this.id = data.id;
        const sp = this.node.getComponent(cc.Sprite);
        sp.spriteFrame = data.iconSF;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    /**
     * 两个碰撞体开始接触时被调用一次
     */
    onBeginContact(contact, self: cc.Component, other: cc.Component) {
        // console.log('碰撞')
        if (self.node && other.node) {
            const s = self.node.getComponent('fruit');
            const o = other.node.getComponent('fruit');
            if (s && o && s.id === o.id) {
                // console.log('一样的水果')
                self.node.emit('sameContact', {self, other})
            }
        }
    }

    // update (dt) {}
}
