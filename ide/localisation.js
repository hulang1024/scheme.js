/**
@class 本地的表示
@param language 语言代码
@param country 地区代码
@param variant 语言变体（例如中文简体/繁体）代码
@author hu lang
*/
function Locale(language, country, variant) {
    this.language = language;
    this.country = country ? country.toUpperCase() : country;
    this.variant = variant ? variant.toUpperCase() : variant;
}

/**
语言地区代码
*/
Locale.prototype.toString = function() {
    return this.language + "_"
        + this.country
        + (this.variant ? "_" + this.variant : "");
}

Locale.prototype.getDisplayLanguage = function() {
    var displayLanguageMap = {
        "en": "English",
        "zh": "中文",
        "ja": "日本語"
    };
    var variantMap = {
        "CHS": "简体",
        "CHT": "繁體"
    };

    return displayLanguageMap[this.language]
        + (this.variant ? "(" + variantMap[this.variant] + ")" : "");
}

Locale.getDefault = function() {
    var displayLanguage = navigator.browserLanguage || navigator.language;//值如"zh-CN"
    return Locale.fromDisplayLanguage(displayLanguage.replace(/-/g, "_"));
}

Locale.fromDisplayLanguage = function(displayLanguage) {
    displayLanguage = displayLanguage.split("_");
    var language = displayLanguage[0];
    if(displayLanguage.length == 3) {
        var country = displayLanguage[1];
        var variant = displayLanguage[2];
        return new Locale(language, country, variant);
    } else if(displayLanguage.length == 2) {
        var country = displayLanguage[1];
        var variant;
        if(language == "zh")
            variant = "CHS";
        return new Locale(language, country, variant);
    } else {
        return new Locale(language);
    }
}

Locale.US = new Locale("en", "US");
Locale.CHINA = new Locale("zh", "CN", "CHS");
Locale.JAPAN = new Locale("ja", "JA");


// 全局变量
var localisationResources = {};

function getLocalisationResourceBundle(locale) {
  var res = {};
  var that = {};

  that.getString = function(code) {
    return res[code];
  }

  that.setLocale = function(loc) {
    locale = loc;
    res = localisationResources[locale.toString()];
  }

  that.setLocale(locale);

  return that;
}
