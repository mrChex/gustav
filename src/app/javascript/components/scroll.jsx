import React from 'react';


export default React.createClass({

  scroll_node: null,
  child_node: null,
  scroll_top_max: null,

  componentDidMount() {
    this.scroll_node = this.getDOMNode();
    this.child_node = this.scroll_node.children[0];
    this.scroll_top_max = this.child_node.offsetHeight - this.scroll_node.offsetHeight;
  },

  componentDidUpdate() {

    let scroll_top_max = this.child_node.offsetHeight - this.scroll_node.offsetHeight;

    if('enable' in this.props) {
      if(this.props.enable) {
        this.scroll_node.scrollTop = scroll_top_max + 30;
      }
    } else {
      if(this.scroll_node.scrollTop > this.scroll_top_max-100) {
        this.scroll_node.scrollTop = scroll_top_max + 30;
      }
    }

    this.scroll_top_max = scroll_top_max;

  },

  render() {

    return <div className="scrollComponent">
      {this.props.children}
    </div>
  }
});
