import en from "./languages/en.json";
import zh from "./languages/zh.json";

type messageType = {
  hello: string;
  intro: string;
  listExample: string;
  literalExample: string;
  linkExample: string;
  settingColorTheme: string;
  settingFirstDayofWeek: string;
  settingImportAppData: string;
  settingExportAppData: string;
  settingSyncAppData: string;
  settingVersion: string;
};

export const EN_MESSAGE: { message: messageType } = {
  message: en,
};

export const ZH_MESSAGE: { message: messageType } = {
  message: zh,
};

export const message: messageType = {
  hello: "message.hello",
  intro: "message.intro",
  listExample: "message.listExample",
  literalExample: "message.literalExample",
  linkExample: "message.linkExample",
  settingColorTheme: "message.settingColorTheme",
  settingFirstDayofWeek: "message.settingFirstDayofWeek",
  settingImportAppData: "message.settingImportAppData",
  settingExportAppData: "message.settingExportAppData",
  settingSyncAppData: "message.settingSyncAppData",
  settingVersion: "message.settingVersion",
};
