import Settings from "../Amaterasu/core/Settings";
import DefaultConfig from "../Amaterasu/core/DefaultConfig";

const default_config = new DefaultConfig("MEGANEsModule", "preferences.json");

default_config.addSwitch({
    category: "Custom Music",
    configName: "enableCustomMusic",
    title: "Custom Music",
    description: "Turn on to enable custom music",
}).addSwitch({
    category: null,
    configName: "enableCustomMusicChat",
    title: "Enable Chat Log",
    description: "Send a chat when start/stop custom music",
}).addSwitch({
    category: "! Commands",
    configName: "enablePartyWarp",
    title: "Enable Party warp by members",
    description: "Send \'!warp\' in party chat to party warp",
}).addSwitch({
    category: null,
    configName: "enableJoin",
    title: "Enable join to dungeons by member",
    description: "Send \'!m7\' in party chat to join M7 ,send \'!t5\' to join Kuudra infernal",
}).addSwitch({
    category: null,
    configName: "enableTransfer",
    title: "Enable transfer by member",
    description: "Send \'!transfer\' in party chat to transfer",
}).addSwitch({
    category: null,
    configName: "enablePartyInvite",
    title: "Enable party invite by whisper",
    description: "Send \'!invite\' by whisper to invite",
}).addSwitch({
    category: null,
    configName: "enableAllInvite",
    title: "Enable all invite by member",
    description: "Send \'!allinvite\' in party chat to enable all invite",
}).addSwitch({
    category: null,
    configName: "enableShowTPS",
    title: "Enable tps command",
    description: "Send \'!tps\' in party chat to show TPS",
}).addSwitch({
    category: null,
    configName: "enableShowPing",
    title: "Enable ping command",
    description: "Send \'!ping\' in party chat to show Ping",
}).addSwitch({
    category: null,
    configName: "enableDice",
    title: "Enable dice commands",
    description: "Send \'!1d100\' in party chat to cast dices",
}).addSwitch({
    category: "Rift",
    configName: "enableBeaconOnEffigies",
    title: "Enable beacon on effigies",
    description: "Enable beacon beam on unbroken effigies",
}).addSwitch({
    category: null,
    configName: "enableUbikTimer",
    title: "Enable Ubik's Cube timer",
    description: "Enable Ubik's Cube timer",
}).addSwitch({
    category: null,
    configName: "enableVampTimers",
    title: "Enable Vampire Slayer's Blood Ichor and Killer Spring timers.",
    description: "Enable Vamp Gimmick Timers",
}).addSwitch({
    category: "SB Miscs",
    configName: "enableAutoReturnTrapper",
    title: "Enable auto return to trapper",
    description: "Auto return to trapper when kill animal",
}).addSwitch({
    category: null,
    configName: "enableInvincibleAbilityTimer",
    title: "Enable Invincible Timer",
    description: "Show timer that you are invincible",
}).addSwitch({
    category: null,
    configName: "enableRunicHighlight",
    title: "Enable Highlight Runic mobs",
    description: "Highlight Runic mobs",
}).addSwitch({
    category: "Developments",
    configName: "enableShowScoreCommand",
    title: "Enable /megsc",
    description: "/megsc to copy scoreboard's valuel",
})

const config = new Settings("MEGANEsModule", default_config).setCommand('meg');
export default () => config.settings;