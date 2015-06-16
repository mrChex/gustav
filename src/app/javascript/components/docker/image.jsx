import React from 'react';
import classNames from 'classnames';
import {socket} from '../../socket';


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    return {"delete_confirmation": false,
            "delete_in_progress": false,
            "delete_success": false}
  },

  delete() {
    if(!this.state.delete_confirmation) {
      this.setState({"delete_confirmation": true})
    } else {
      this.setState({"delete_in_progress": true})
      this.props.delete_image(this.props.image.Id);
    }
  },

  render() {

    let {image} = this.props;

    let Id = image.Id.slice(0,12);

    let deleteCls = classNames({
      btn: true,
      "btn-xs": true,
      "btn-danger": true,
      hidden: this.state.delete_in_progress
    });

    let confirmationCls = classNames({
      hidden: !this.state.delete_confirmation
    });

    let trCls = classNames({
      danger: this.state.delete_in_progress
    });

    return (<tr className={trCls}>

      <td>{Id}</td>
      <td>
        {image.RepoTags.map((tag) => {return(
          <div key={tag}>{tag}</div>
        )})}
      </td>
      <td>
        <button type="button" className={deleteCls} onClick={this.delete}>
          <span className="glyphicon glyphicon-trash"></span>
          <span className={confirmationCls}> Delete?</span>
        </button>
      </td>

    </tr>)

  }
});
