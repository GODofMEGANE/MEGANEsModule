import settings from "./gui.js";
import renderBeaconBeam from "../BeaconBeam/index.js";

let S03PacketTimeUpdate = Java.type("net.minecraft.network.play.server.S03PacketTimeUpdate");
let S37PacketStatistics = Java.type("net.minecraft.network.play.server.S37PacketStatistics");
let C16PacketClientStatus = Java.type("net.minecraft.network.play.client.C16PacketClientStatus");
let S01PacketJoinGame = Java.type("net.minecraft.network.play.server.S01PacketJoinGame");

// ----- Custom Music -----
const CUSTOM_MUSIC_LIST = [
    /*{
        name: "Vampire Slayer",
        trigger: { type: "slayer", value: "Riftstalker" },
        music: "vampireslayer.ogg",
        isloop: true,
    },*/
    {
        name: "The Rift",
        trigger: { type: "dimension", value: "Rift Dimensio" },
        music: "rift.ogg",
        isloop: true,
    },
];
const music_state = [];

const DUNGEON_FLOOR = ["CATACOMBS_FLOOR_ONE", "CATACOMBS_FLOOR_TWO", "CATACOMBS_FLOOR_THREE", "CATACOMBS_FLOOR_FOUR", "CATACOMBS_FLOOR_FIVE", "CATACOMBS_FLOOR_SIX", "CATACOMBS_FLOOR_SEVEN"];
const KUUDRA_TIER = ["KUUDRA_NORMAL", "KUUDRA_HOT", "KUUDRA_BURNING", "KUUDRA_FIERY", "KUUDRA_INFERNAL"];

new Thread(() => {
    CUSTOM_MUSIC_LIST.forEach((elm => {
        music_state.push({
            name: elm.name,
            sound: new Sound({ source: elm.music, loop: elm.isloop, stream: true, attenuation: 0, category: "music" }),
            isplaying: false,
        });
    }));
}).start();

register('step', () => {
    if (!settings().enableCustomMusic) {
        music_state.forEach((elm) => {
            stopMusic(elm);
        });
    }
    else {
        CUSTOM_MUSIC_LIST.forEach((elm) => {
            if (elm.trigger.type === "slayer") {
                let music = music_state.filter((val) => { return val.name === elm.name })[0];
                if (Scoreboard.getLines().some(line => ChatLib.removeFormatting(line).includes("Slay the boss!")) && Scoreboard.getLines().some(line => ChatLib.removeFormatting(line).includes(elm.trigger.value))) {
                    playMusic(music);
                }
                else {
                    stopMusic(music);
                }
            }
            if (elm.trigger.type === "dimension") {
                let music = music_state.filter((val) => { return val.name === elm.name })[0];
                if (Scoreboard.getLines().some(line => ChatLib.removeFormatting(line).includes(elm.trigger.value))) {
                    playMusic(music);
                }
                else {
                    stopMusic(music);
                }
            }
            if (elm.trigger.type === "zone") {
                let music = music_state.filter((val) => { return val.name === elm.name })[0];
                if (Scoreboard.getLines().some(line => ChatLib.removeFormatting(line).includes("⏣ " + elm.trigger.value))) {
                    playMusic(music);
                }
                else {
                    stopMusic(music);
                }
            }
        });
    }
});

function playMusic(music) {
    if (!music.isplaying) {
        if (settings().enableCustomMusicChat) {
            ChatLib.chat("Play Music: " + music.name);
        }
        music.sound.play();
        music.isplaying = true;
    }
}

function stopMusic(music) {
    if (music.isplaying) {
        if (settings().enableCustomMusicChat) {
            ChatLib.chat("Stop Music: " + music.name);
        }
        music.sound.stop();
        music.isplaying = false;
    }
}


// ----- Party ! commands -----
register("chat", (rank, name, message) => {
    //ChatLib.chat(`${message} by ${name}`);
    if (settings().enablePartyWarp && message.toLowerCase().endsWith('!warp')) {
        ChatLib.command("p warp");
    }
    if (settings().enableJoin) {
        for (let i = 1; i <= 7; i++) {
            if (message.toLowerCase().endsWith(`!m${i}`)) {
                ChatLib.command(`joindungeon MASTER_${DUNGEON_FLOOR[i - 1]}`);
            }
        }
        for (let i = 1; i <= 7; i++) {
            if (message.toLowerCase().endsWith(`!f${i}`)) {
                ChatLib.command(`joindungeon ${DUNGEON_FLOOR[i - 1]}`);
            }
        }
        for (let i = 1; i <= 5; i++) {
            if (message.toLowerCase().endsWith(`!t${i}`)) {
                ChatLib.command(`joindungeon ${KUUDRA_TIER[i - 1]}`);
            }
        }
    }
    if (settings().enableTransfer) {
        if (message.toLowerCase().endsWith(`!transfer`)) {
            ChatLib.command(`p transfer ${name}`);
        }
        if (message.toLowerCase().endsWith(`!promote`)) {
            ChatLib.command(`p promote ${name}`);
        }
    }
    if (settings().enableAllInvite) {
        if (message.toLowerCase().endsWith(`!allinvite`)) {
            ChatLib.command(`p setting allinvite`);
        }
    }
    if (settings().enableShowTPS) {
        if (message.toLowerCase().endsWith(`!tps`)) {
            ChatLib.command(`pchat TPS: ${tps.toFixed(2)}[ticks/s]`);
        }
    }
    if (settings().enableShowPing) {
        if (message.toLowerCase().endsWith(`!ping`)) {
            ChatLib.command(`pchat Ping: ${ping.toFixed(0)}[ms]`);
        }
    }
    if (settings().enableDice) {
        if (message.toLowerCase().match(/!\d+d\d+$/)) {
            let [count, sides] = message.match(/\d+/g).map(Number);
            if (count > 1000 || sides > 1000) {
                ChatLib.command(`pchat Too many dices!`);
            }
            else {
                let results = [];
                for (let i = 0; i < count; i++) {
                    results.push(Math.floor(Math.random() * sides + 1));
                }
                let total = results.reduce((a, b) => a + b, 0);
                ChatLib.command(`pchat ${message} > ${results.join(", ")} (Total: ${total})`);
            }
        }
        if (message.toLowerCase().startsWith("!ccb<=")) {
            let target = parseInt(message.split("<=")[1].trim());
            if (!isNaN(target) && target <= 100) {
                let diceRoll = Math.floor(Math.random() * 100 + 1);
                if (diceRoll <= target) {
                    if (diceRoll <= 5) {
                        ChatLib.command(`pchat (1D100<=${target}) ＞ ${diceRoll} ＞ 決定的成功`);
                    }
                    else if (diceRoll <= target / 5) {
                        ChatLib.command(`pchat (1D100<=${target}) ＞ ${diceRoll} ＞ スペシャル`);
                    }
                    else {
                        ChatLib.command(`pchat (1D100<=${target}) ＞ ${diceRoll} ＞ 成功`);
                    }
                } else {
                    if (diceRoll >= 96) {
                        ChatLib.command(`pchat (1D100<=${target}) ＞ ${diceRoll} ＞ 致命的失敗`);
                    }
                    else {
                        ChatLib.command(`pchat (1D100<=${target}) ＞ ${diceRoll} ＞ 失敗`);
                    }
                }
            } else {
                ChatLib.command("pchat Invalid target value.");
            }
        }
    }
}).setCriteria("&r&9Party &8> ${rank} ${name}&f: &r${message}&r");

// !invite
register("chat", (rank, name, message) => {
    if (settings().enablePartyInvite && message.toLowerCase().endsWith('!invite')) {
        ChatLib.command(`p ${name}`);
    }
}).setCriteria("&dFrom ${rank} ${name}&r&7: &r&7${message}&r");

// !tps
let tps = 20;
register("command", (args) => {
    if (settings().enableShowTPS) {
        ChatLib.chat(`TPS: ${tps.toFixed(2)}[ticks/s]`);
    }
}).setName("megtps");

let last_packet_time = 0;
register("packetReceived", () => {
    if (settings().enableShowTPS) {
        let now_packet_time = Date.now();
        tps = Math.min(20000 / (now_packet_time - last_packet_time), 20);
        last_packet_time = now_packet_time;
    }
}).setFilteredClass(S03PacketTimeUpdate);

// !ping
let ping = 0;
register("command", (args) => {
    if (settings().enableShowPing) {
        ChatLib.chat(`Ping: ${ping.toFixed(0)}[ms]`);
    }
}).setName("megping");

let last_ping_time = -1;
register("step", () => {
    if(settings().enableShowPing && last_ping_time === -1){
        Client.sendPacket(new C16PacketClientStatus(
            C16PacketClientStatus.EnumState.REQUEST_STATS
        ));
        last_ping_time = Date.now();
    }
}).setDelay(3);
register("packetReceived", () => {
    if(settings().enableShowPing && last_ping_time !== -1){
        ping = Math.abs(Date.now() - last_ping_time);
        last_ping_time = -1;
    }
}).setFilteredClasses([S01PacketJoinGame, S37PacketStatistics]);

// ----- Dungeons -----
// Ally Hp Warn
register("step", () => {
    if(settings().enableAllyHpWarn){
        let sc_lines = Scoreboard.getLines();
        let matched = sc_lines.find(sc_line => /^§e\[[ABHMT]\] \S+ §c(?!DEAD$)\S+$/.test(sc_line.toString()));
        if(matched){
            Client.showTitle("§cLow HP!", `§b${matched.toString().match(/^§e\[[ABHMT]\] (\S+) §c\S+$/)[1]}`, 0, 50, 10);
        }
    }
});

// ----- SB Miscs -----
// Warp to trapper
register("chat", () => {
    if (settings().enableAutoReturnTrapper) {
        ChatLib.command(`warp trapper`);
    }
}).setCriteria("&r&aReturn to the Trapper soon to get a new animal to hunt!&r");

// Invincible Timer
let invincible_ticks = 0;
function setInvincibleTimer(seconds) {
    invincible_ticks = World.getTime() + seconds * 20;
}
register('renderOverlay', () => {
    if (settings().enableInvincibleAbilityTimer && invincible_ticks > World.getTime()) {
        let centered_x = Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`Invincible! ${((invincible_ticks - World.getTime()) / 20).toFixed(2)}`) / 2;
        let render_text;
        if (invincible_ticks > World.getTime() + 20) {
            render_text = new Text(`Invincible! ${((invincible_ticks - World.getTime()) / 20).toFixed(2)}`, centered_x, 250).setColor(Renderer.GREEN);
        }
        else {
            render_text = new Text(`Invincible! ${((invincible_ticks - World.getTime()) / 20).toFixed(2)}`, centered_x, 250).setColor(Renderer.RED);
        }
        render_text.draw();
    }
});

register("chat", (fragment) => {
    if (settings().enableInvincibleAbilityTimer) {
        console.log("Bonzo's Mask activated!");
        setInvincibleTimer(3);
    }
}).setCriteria("&r&aYour &r${fragment}Bonzo's Mask &r&asaved your life!&r");
register("chat", () => {
    if (settings().enableInvincibleAbilityTimer) {
        console.log("Spirit Mask activated!");
        setInvincibleTimer(3);
    }
}).setCriteria("&r&6Second Wind Activated&r&a! &r&aYour Spirit Mask saved your life!&r");
register("chat", (rarity_color) => {
    if (settings().enableInvincibleAbilityTimer) {
        console.log("Phoenix Pet activated!");
        setInvincibleTimer(4);
    }
}).setCriteria("&r&eYour &r${rarity_color}Phoenix Pet &r&esaved you from certain death!&r");

register("worldLoad", () => {
    invincible_ticks = 0;
});

// Runic Highlight
register('renderWorld', () => {
    if (settings().enableRunicHighlight) {
        let in_catacombs = Scoreboard.getLines().some(text => text.toString().replace(/§./g, '').replace(/[^a-zA-Z0-9]/g, '').includes("Catacombs"));
        console.log(`in_catacombs: ${in_catacombs}`);
        World.getAllEntities().filter(entity => {
            return (in_catacombs && (entity.getName().startsWith("§c§5") || entity.getName().startsWith("§6✯ §c§5"))) || /^§5\[§dLv\d+§5\] §c§5(.+ )?§d[\d,\.kMB]+§f\/§5[\d,\.kMB]+§c❤$/.test(entity.getName());
        }).forEach(entity => {
            renderBeaconBeam(entity.getX(), 0, entity.getZ(), 0.5, 0, 0.5, 1, false, 300);
            renderBeaconBeam(entity.getX(), entity.getY(), entity.getZ(), 1, 0.5, 1, 1, false, 300);
        });
    }
});

// Server Memories
let servers = [];
register("chat", (server) => {
    if (settings().enableServerMemories) {
        servers.push({"server" : server, "time" : Date.now()});
        for(let index = servers.length-1; index >= 0; index--){
            if(servers[index].time < Date.now() - 20*60*1000){
                servers.splice(index, 1);
            }
        }
        let count = servers.filter((history) => server === history.server).length;
        ChatLib.chat(`${(count==1)?"§7":"§e"}Visited this server: ${count}`);
    }
}).setCriteria("&7Sending to server ${server}...&r");

// ----- Developments -----
register("command", (args) => {
    if (settings().enableShowScoreCommand) {
        ChatLib.chat("Printing scoreboard text...");
        let sc_lines = Scoreboard.getLines();
        console.log("-----Scoreboard-----");
        sc_lines.forEach(sc_line => {
            console.log(sc_line);
        });
        console.log("-------------------");
    }
}).setName("megsc");


// ----- Rift -----
const EFFIGIES_COORDS = [
    { x: 150, y: 73, z: 95 },
    { x: 193, y: 87, z: 119 },
    { x: 235, y: 104, z: 147 },
    { x: 293, y: 90, z: 134 },
    { x: 262, y: 93, z: 94 },
    { x: 240, y: 123, z: 118 },
];

let effigies = [false, false, false, false, false, false];
register('step', () => {
    let sc_lines = Scoreboard.getLines();
    if (sc_lines.some(text => text.toString().replace(/§./g, '').replace(/[^a-zA-Z0-9]/g, '') === "StillgoreChteau")) {
        let effigies_line = sc_lines.find(text => text.toString().startsWith("Effigies:"));
        if(!effigies_line){
            return;
        }
        let effigies_str = effigies_line.toString().match(/§(.)/g);
        effigies_str.forEach((c, i) => {
            // c:Broken, 7:Alive
            if (c === "§7") {
                effigies[i] = false;
            }
            else if (c === "§c") {
                effigies[i] = true;
            }
        });
    }
});

let last_ubik = 0;
register("chat", (motes) => {
    console.log("Ubik's Cube is done!");
    last_ubik = Date.now();
}).setCriteria("&r&eYou earned &r&5${motes} Motes &r&ein this match!&r");
register("chat", (time_str) => {
    console.log(`Ubik's Cube is already done! (${time_str})`);
    let match = time_str.match(/(?:\s*(\d+)h)?(?:\s*(\d+)m)?(?:\s*(\d+)s)?/);
    if (!match) {
        console.log("Invalid time format!");
        return;
    }
    let hours = parseInt(match[1] || "0", 10);
    let minutes = parseInt(match[2] || "0", 10);
    let seconds = parseInt(match[3] || "0", 10);
    last_ubik = Date.now() - 2 * 3600 * 1000 + (hours * 3600 + minutes * 60 + seconds) * 1000;
}).setCriteria("&r&b&lSPLIT! &r&cYou need to wait ${time_str} before you can play again.&r");

register('renderOverlay', () => {
    if (settings().enableUbikTimer) {
        if (last_ubik + 2 * 3600 * 1000 < Date.now()) {
            let render_text = new Text(`Ubik's Cube is ready!`, 80, 22).setColor(Renderer.GREEN).setScale(0.6);
            render_text.draw();
        }
        else {
            let time_ubik = (last_ubik + 2 * 3600 * 1000 - Date.now()) / 1000;
            let time_str = [];
            if (Math.floor(time_ubik / 3600) > 0) {
                time_str.push(`${Math.floor(time_ubik / 3600)}h`);
            }
            if (Math.floor(time_ubik % 3600 / 60) > 0) {
                time_str.push(`${Math.floor(time_ubik % 3600 / 60)}m`);
            }
            if (Math.floor(time_ubik % 60) > 0) {
                time_str.push(`${Math.floor(time_ubik % 60)}s`);
            }
            let render_text = new Text(`Ubik's Cube: ${time_str.join(" ")}`, 80, 22).setColor(Renderer.RED).setScale(0.6);
            render_text.draw();
        }
    }
    if (settings().enableVampTimers) {
        let sc_lines = Scoreboard.getLines();
        if (sc_lines.some(text => text.toString().replace(/§./g, '').replace(/[^a-zA-Z0-9]/g, '') === "RiftstalkerBloodfiendV") && sc_lines.some(text => text.toString().replace(/§./g, '').replace(/[^a-zA-Z0-9]/g, '') === "Slaytheboss")) {
            let ichor_timer = Infinity;
            World.getAllEntities().filter(entity => {
                return /^§c(\d+(\.\d+)?)s$/.test(entity.getName());
            }).forEach(entity => {
                let timer = Number(entity.getName().match(/^§c(\d+(\.\d+)?)s$/)[1]);
                if (timer < ichor_timer) {
                    ichor_timer = timer;
                }
            });
            if (ichor_timer != Infinity) {
                let centered_x = Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`Blood Ichor:${ichor_timer.toFixed(1)}s`) / 2 - 100;
                let render_text = new Text(`Blood Ichor:${ichor_timer.toFixed(1)}s`, centered_x, 400).setColor(Renderer.RED).setScale(1);
                render_text.draw();
            }
            else {
                let centered_x = Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`Blood Ichor:Not Active`) / 2 - 100;
                let render_text = new Text(`Blood Ichor:Not Active`, centered_x, 400).setColor(Renderer.GREEN).setScale(1);
                render_text.draw();
            }

            let spring_timer = Infinity;
            World.getAllEntities().filter(entity => {
                return /^§c§lBOOM §a(\d+(\.\d+)?)s$/.test(entity.getName());
            }).filter(entity => {
                return (Math.pow(entity.getX()-Player.getX(), 2)+Math.pow(entity.getY()-Player.getY(), 2)+Math.pow(entity.getZ()-Player.getZ(), 2)) < Math.pow(20, 2);
            }).forEach(entity => {
                let timer = Number(entity.getName().match(/^§c§lBOOM §a(\d+(\.\d+)?)s$/)[1]);
                if (timer < spring_timer) {
                    spring_timer = timer;
                }
            });
            if (spring_timer != Infinity) {
                let centered_x = Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`Killer Spring:${spring_timer.toFixed(1)}s`) / 2 + 100;
                let render_text = new Text(`Killer Spring:${spring_timer.toFixed(1)}s`, centered_x, 400).setColor(Renderer.RED).setScale(1);
                render_text.draw();
            }
            else {
                let centered_x = Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(`Killer Spring:Not Active`) / 2 + 100;
                let render_text = new Text(`Killer Spring:Not Active`, centered_x, 400).setColor(Renderer.GREEN).setScale(1);
                render_text.draw();
            }
        }
    }
});

register('renderWorld', () => {
    if (settings().enableBeaconOnEffigies && Scoreboard.getLines().some(text => text.toString().replace(/§./g, '').replace(/[^a-zA-Z0-9]/g, '') === "StillgoreChteau")) {
        effigies.forEach((is_broken, i) => {
            if (!is_broken) {
                renderBeaconBeam(EFFIGIES_COORDS[i].x, EFFIGIES_COORDS[i].y, EFFIGIES_COORDS[i].z, 1, 0, 0, 1, false, 300);
            }
        });
    }
});