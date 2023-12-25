import React, {useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    function createNewRoom(event){
        event.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        toast.success("Created A New Room");
    }

    function joinRoom(){
        if(!username || !roomId){
            toast.error("Room ID & Username is required");
            return;
        }

        //If everything is properly filled then redirect the user to the room
        // navigate('where to send', 'what to send')
        navigate(`/editor/${roomId}`, { state: {username,}});
    }

    //If the user presses enter key then it should also join a new room
    function handleInputEnter(event){
        if(event.code === 'Enter'){
            joinRoom();
        }

    }
    return (
        <div className='homePageWrapper'>
            <div className='formWrapper'>
            <img className="homePageLogo" src='./my-logo.jpg' alt='code-logo'/>
            <h4 className='mainLabel'>Paste Invitation Room ID</h4>
            <div className='inputGroup'>
                <input type='text' 
                    className='inputBox' 
                    placeholder='ROOM ID'
                    onChange={(event)=>setRoomId(event.target.value)} 
                    value={roomId} 
                    onKeyUp={handleInputEnter}
                />
                <input type='text' 
                    className='inputBox' 
                    placeholder='username' 
                    onChange={(event)=>setUsername(event.target.value)} 
                    value={username}
                    onKeyUp={handleInputEnter} 
                />
                <button className='btn joinBtn' onClick={joinRoom}>Join</button>
                <span className='createInfo'>
                    If you don't have an invite then create &nbsp;
                    <a onClick={createNewRoom} href="" className='createNewBtn'>new room</a>
                </span>
            </div>
            </div>
            <footer>
                <h4>Made with ❤️ by &nbsp; <a href='https://github.com/mdtauseef123'>Md Tauseef Akhtar</a></h4>
            </footer>
        </div>
    );
}

export default Home