var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {

  bootstrapCustomizations: "./_bootstrap-customizations.scss",
  mainSass: "./_main.scss",

  verbose: false,
  debug: true,
  // styleLoader: "style-loader!css-loader!sass-loader",
  styleLoader: ExtractTextPlugin.extract("style-loader", "css-loader!sass?outputStyle=expanded"),
  scripts: {
    'modal': false,  // use react tricks and css for this!
  },
  styles: {
    "mixins": true,

    "normalize": true,
    "print": true,

    "scaffolding": true,
    "type": true,
    "code": true,
    "grid": true,
    "tables": true,
    "forms": true,
    "buttons": true,

    "component-animations": true,
    "glyphicons": true,
    "dropdowns": true,
    "button-groups": true,
    "input-groups": true,
    "navs": true,
    "navbar": true,
    "breadcrumbs": true,
    "pagination": true,
    "pager": true,
    "labels": true,
    "badges": true,
    "jumbotron": true,
    "thumbnails": true,
    "alerts": true,
    "progress-bars": true,
    "media": true,
    "list-group": true,
    "panels": true,
    "wells": true,
    "close": true,

    "modals": true,
    "tooltip": true,
    "popovers": true,
    "carousel": true,

    "utilities": true,
    "responsive-utilities": true
  }
};
