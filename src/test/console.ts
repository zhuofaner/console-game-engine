import { Console } from "../basic/Console";
let con1 = new Console({
    // 构造了一个宿主
    log: function(content){
        global.console.log(content);
    }
});
// 范例1
con1.log("-------RAW-----")
    .record()
    .log("node1:", "TAG CREATED!")
    .log("node2:", "TAG CREATED!")
    .log("node3:", "TAG CREATED!")
    .log("leaf1:", "TAG CREATED!")
    .log("leaf2:", "TAG CREATED!")
    .stop()
    .log("------end-------\n");

// 范例2
con1.log("format:", "-----start2------")
    .tagnone()
    .tag("node1").tag("node2")
    .tag("leaf1").add("node1", "node2", "test")
    .play()
    .log("format:", "------end2-------\n");

// 范例3
con1.log("format:", "-----start3------")
    .tagnone()
    .tag("node3")
    .tag("leaf2").add("leaf1", "node1", "node3")
    .play()
    .log("format:", "-----end3------\n");

// 范例4
con1.log("format:", "-----start4------")
    .tagnone().play()
    .log("format:", "-----end4------\n");