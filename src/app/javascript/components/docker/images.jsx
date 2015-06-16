import React from 'react';
import classNames from 'classnames';
import {Link, RouteHandler} from 'react-router';
import { socket } from '../../socket';
import Image from './image';


export default React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    let { all } = this.context.router.getCurrentParams();
    all = all === "all"

    return {"images": null,
            "show_all": all}
  },

  componentWillReceiveProps() {
    this.replaceState(this.getInitialState(), function() {
      this.fetchImages();
    });
  },

  componentDidMount() {
    this.fetchImages();
  },

  fetchImages() {
    socket.emit('images', {all: this.state.show_all}, (err, images) => {
      console.log(images);
      this.setState({"images": null});
      this.setState({"images": images});
    });
  },

  delete_image(image_name) {
    socket.emit("delete image", image_name, (err, data) => {
      if(err) {
        console.log("DELETENG ERROR", err);
        alert(err.json);
      }
      this.fetchImages()
    });
  },

  render() {
    if(!this.state.images) {return <h3>Loading images...</h3>}

    let imagesCls = classNames({
      "active": this.context.router.isActive("docker-page-images-list")
    });

    let allCls = classNames({
      "active": this.context.router.isActive("docker-page-images-list-all")
    });

    return (<div>


      <ul className="nav nav-pills">
        <li role="presentation" className={imagesCls}><Link to='docker-page-images-list'>Filtered</Link></li>
        <li role="presentation" className={allCls}><Link to='docker-page-images-list-all' params={{all:'all'}}>All</Link></li>
      </ul>

      <table className="table table-bordered table-striped" style={{marginTop:10}}>
        <tr>
          <th>ID</th>
          <th>Tags</th>
          <th style={{width:130}}>Actions</th>
        </tr>

        {this.state.images.map((image)=> { return (
          <Image image={image} delete_image={this.delete_image} key={image.Id} />
        )})}

      </table>
    </div>)

  }
});
