import React from "react";
import Avatar from "react-avatar";
function Client(props){

    return (
        <div className="client">
            <Avatar name={props.username} size={50} round="14px"/>
            <span className="userName">{props.username}</span>
        </div>
    );

}

export default Client;