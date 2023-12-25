import React, {useEffect, useRef, useState} from 'react';
import toast from 'react-hot-toast';
import Client from './Client';
import Editor from './Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Action';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';


const EditorPage = () => {
    // Initialization of sockets
    // useRef() is react hook
    // useRef() is used to store data which needs to be available at multiple render
    // and on changing that data the component will not re-render then we use useRef()
    // Basically when we use useState the entire component will get re-render if there is a change in that state
    // But that is not the case with useRef() hook
    const socketRef = useRef(null);
    const location = useLocation();// For getting the username that is passed from Home.jsx file
    const reactNavigator = useNavigate();// For re-directing it to the home page
    const codeRef = useRef(null);


    const [clients, setClients] = useState([]);
    // useParams() will bascially return the parameters of the URL in the object format
    // In our case it is  {roomId: "4a891-785225-adf5562-dfgh"}
    // so we can call like const param = useParams(); and then param.roomId or simply {roomId} = useParams();
    const {roomId} = useParams();// Getting roomId from the URL that is sent from Home.jsx
    useEffect(()=> {
        const init = async () => {
            //When the user connected to our server following code will be executed
            socketRef.current = await initSocket();//Just initializing the socket from socket.js file 


            //Handling WS Errors to show the client what exactly went wrong
            //If there is error while connecting to the server then following error will occured
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            // If connection got failed then following error will occured
            socketRef.current.on('connect_failed', (err) => handleErrors(err));
            function handleErrors(err) {
                console.log('socket error', err);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');//If there is some error while connecting to the server then navigate to the home page
            }


            // Reason for using ACTION is that whenever we are working with the strings there can be a 
            // chance for typo so and that too when that string is going to be used in multiple places
            // so that's why we use key-value object property so that we can avoid any error
            socketRef.current.emit(ACTIONS.JOIN, {
                roomId, //Sending the roomId and username whenever any user join to the server
                username: location.state?.username, //What we receive from Home.jsx. For some reason if the username
                                                    // not exist then we will not proceed due to which we put ? mark
            });

            //For listening the JOINED event
            socketRef.current.on(ACTIONS.JOINED, ({clients, username, socketId}) => {
                // If the joined user is not the current user then only show the pop-up message
                // otherwise it will be irrelevant to show my name when I firstly join the room
                // So this message is for those who will join the original author room.
                if(username != location.state?.username){
                    toast.success(`${username} joined the room.`);
                    console.log(username, "joined");
                }
                setClients(clients);

                // Auto-syncing code for the first load
                // If there is already code written on the editor and then the user join 
                // then we have to show the written code. Previously it is not showing in this scenario
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
            });

            //Listening for the disconnecting event
            socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username}) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => {
                    return prev.filter((client) => {
                        return client.socketId !== socketId;
                    });
                });
            });

        }
        init();
        // We have to clear all the listeners(.on()) otherwise there can be problem of memory leak
        // In useEffect whenever we return any function this function is known as Cleaning function
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    //Copying the room Id
    // Since we are using browser API so we will be using async function
    async function copyRoomId(){
        try{
            await navigator.clipboard.writeText(roomId);
            toast.success('Copied to your Clipboard');
        }
        catch(err){
            toast.error('Could not copy the ROOM ID');
            console.log(err);
        }
    }

    //Leaving the room
    function leaveRoom(){
        // We just have to re-direct the user to Home page
        reactNavigator('/');
    }
    

    //If we don't get username then in that case we will redirect to Home Page
    // Navigate is used to re-direct the route
    if (!location.state) {
        return <Navigate to="/" />;
    }
    return (
        <div className='mainWrap'>
            <div className='aside'>
                <div className='asideInner'>
                    <div className='logo'>
                        <img className="logoImage" 
                        src='/my-logo.jpg'
                        alt='Logo-Image'
                        />

                    </div>
                    <h3>Connected</h3>
                    <div className='clientsList'>
                    {
                        clients.map((client) => {
                            return <Client key={client.socketId} username={client.username}/>
                        })
                    }
                    </div>

                </div>
                <button className='btn copyBtn' onClick={copyRoomId}>Copy ROOM ID</button>
                <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>
            </div>

            <div className='editorWrap'>
                <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {codeRef.current = code;}}/>

            </div>

        </div>
    )
}

export default EditorPage;