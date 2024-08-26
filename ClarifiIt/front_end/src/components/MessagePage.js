import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Avatar from './Avatar';
import { FaHandshake } from 'react-icons/fa';
import { IoMdDownload } from "react-icons/io";
import { FaAngleLeft, FaPlus, FaMicrophone } from 'react-icons/fa6';
import { FaImage, FaVideo } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { IoMdSend } from 'react-icons/io';
import uploadFile from '../helpers/uploadFile';
import Loading from './Loading';
import backgroundImage from '../assets/wall.jpg';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { setMood } from '../redux/userSlice';  // Update the path as needed

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const user = useSelector((state) => state?.user);
  const dispatch = useDispatch();

  const handleMoodChange = (selectedMood) => {
    setMood(selectedMood);
    dispatch(setMood(selectedMood));  // Dispatch the action to update the Redux store
    // Emit mood change to the server (you can implement this)
    if (socketConnection) {
      socketConnection.emit('user-mood', {
        userId: user._id,
        mood: selectedMood,
      });
    }
  };


console.log("find the mood color",user)

  const [dataUser, setDataUser] = useState({
    name: '',
    email: '',
    profile_pic: '',
    online: false,
    _id: '',
    mood:"neutral",
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: '',
    imageUrl: '',
    videoUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const [showTerminationOptions, setShowTerminationOptions] = useState(false);
  const currentMessage = useRef(null);
  const recognitionRef = useRef(null);

  const terminationMessages = [
    "It was great talking to you. Have a nice day!",
    "I'll catch up with you later. Goodbye!",
    "Let's continue this conversation another time. Take care!",
  ];

  // Define your shortcuts
  const shortcuts = {
    '/brb': 'Be right back',
    '/omw': 'On my way',
    '/gtg': 'Got to go',
  };

 
  const expandShortcuts = (text) => {
    let expandedText = text;
    Object.keys(shortcuts).forEach((shortcut) => {
      expandedText = expandedText.replace(new RegExp(shortcut, 'g'), shortcuts[shortcut]);
    });
    return expandedText;
  };

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allMessage]);

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId);
      socketConnection.on('message-user', (data) => {
        setDataUser(data);
      });
      socketConnection.on('message', (data) => {
        setAllMessage(data);
      });
    }
  }, [socketConnection, params?.userId, user]);

  useEffect(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage((prev) => ({ ...prev, text: transcript }));
      };
    }
  }, []);

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload((prev) => !prev);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);
    setMessage((prev) => ({ ...prev, imageUrl: uploadPhoto.url }));
  };

  const handleClearUploadImage = () => {
    setMessage((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);
    setMessage((prev) => ({ ...prev, videoUrl: uploadPhoto.url }));
  };

  const handleClearUploadVideo = () => {
    setMessage((prev) => ({ ...prev, videoUrl: '' }));
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setMessage((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        const expandedText = expandShortcuts(message.text);
        
        socketConnection.emit('new message', {
          
          sender: user?._id,
          receiver: params.userId,
          text: expandedText,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id,
        });
        setMessage({ text: '', imageUrl: '', videoUrl: '' });
      }
    }
  };

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleTerminationOptionClick = (terminationMessage) => {
    if (socketConnection) {
      socketConnection.emit('new message', {
        sender: user?._id,
        receiver: params.userId,
        text: terminationMessage,
        imageUrl: '',
        videoUrl: '',
        msgByUserId: user?._id,
      });
      setShowTerminationOptions(false);
    }
  };


  const moodColors = {
    "😊 Happy": 'bg-green-200',
    "😢 Sad": 'bg-blue-200',
    "😡 Angry": 'bg-red-200',
    "😐 Neutral": 'bg-gray-00',
    // Add more moods as needed
};


  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className='bg-no-repeat bg-cover '>
      <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
        <div className='flex items-center gap-4'>
          <Link to={'/'} className='lg:hidden'>
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar width={50} height={50} imageUrl={dataUser?.profile_pic} name={dataUser?.name} userId={dataUser?._id} />
          </div>
          <div>
            <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>
            <p className='-my-2 text-sm'>{dataUser.online ? <span className='text-primary'>online</span> : <span className='text-slate-400'>offline</span>}</p>
          </div>
        </div>
        <div>
          <button className='cursor-pointer hover:text-primary ml-1 mt-4' onClick={() => setShowTerminationOptions((prev) => !prev)}>
            <FaHandshake size={25} />
          </button>
        </div>
      </header>

<section className='h-[calc(100vh-128px)]   overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200  '>
        <div className='flex flex-col gap-2 py-2 mx-2' ref={currentMessage}>
          {allMessage.map((msg, index) => (
            <div
              key={index}
              className={`p-1 py-1 rounded  border cursor-pointer hover:border-secondary w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${user._id === msg?.msgByUserId ? 'ml-auto bg-teal-100' : 'bg-white'}`}
            >
              <div className='w-full relative'>
                {msg?.imageUrl && <div><img src={msg?.imageUrl} className='w-full h-full object-scale-down' />
                <a href={msg.imageUrl} download='image.jpg'>
                      <button className='  hover:bg-white text-slate-700 font-bold py-2 px-4 rounded-full '>
                      <IoMdDownload/>
                      </button>
                    </a>
                    </div>}
                {msg?.videoUrl && <div><video src={msg.videoUrl} className='w-full h-full object-scale-down' controls />
                <a href={msg.videoUrl} download='video.mp4'>
                <button className='  hover:bg-white text-slate-700 font-bold py-2 px-4 rounded-full '>
                <IoMdDownload/>
                </button>
              </a>
              </div>}
              </div>
              <p className='px-2'>{msg.text}</p>
              <p className='text-xs ml-auto w-fit'>{moment(msg.createdAt).format('hh:mm')}</p>
            </div>
          ))}
        </div>

        {message.imageUrl && (
          <div className='w-full h-full sticky bottom-0  bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadImage}>
              <IoClose size={30} />
            </div>
            <div className='bg-white p-3'>
              <img src={message.imageUrl} alt='uploadImage' className='aspect-square w-full h-full max-w-sm m-2 object-scale-down' />
              
            </div>
          </div>
        )}

        {message.videoUrl && (
          <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadVideo}>
              <IoClose size={30} />
            </div>
            <div className='bg-white p-3'>
              <video src={message.videoUrl} className='aspect-square w-full h-full max-w-sm m-2 object-scale-down' controls muted autoPlay />
              
            </div>
          </div>
        )}

        {loading && (
          <div className='w-full h-full flex sticky bottom-0 justify-center items-center'>
            <Loading />
          </div>
        )}
      </section>


      <footer className='sticky  bottom-0 left-0 w-full  rounded bg-white flex justify-between items-center py-2 h-16 px-4'>
        <div className='relative'>
          <FaPlus  size={23} className='cursor-pointer hover:text-primary' onClick={handleUploadImageVideoOpen} />
          {openImageVideoUpload && (
            <div className='absolute bottom-full left-0 bg-white border hover:border-primary rounded z-10 p-2 flex gap-5 m-1'>
              <label className='cursor-pointer hover:text-primary'>
                <FaImage 
                size={23}/>
                <input type='file' accept='image/*' onChange={handleUploadImage} className='hidden' />
              </label>
              <label className='cursor-pointer hover:text-primary'>
                <FaVideo 
                size={23}/>
                <input type='file' accept='video/*' onChange={handleUploadVideo} className='hidden' />
              </label>
            </div>
          )}
        </div>
  <div className='rounded-full '>
         {/* Mood selector */}
  {/* Mood selector */}
  
  <select onChange={(e) => handleMoodChange(e.target.value)} className={`border rounded-3xl w-13 ml-1 mr-1  ${moodColors[user.mood]} `}>
    <option value="">{user.mood}</option>
    <option value="😐 Neutral">Neutral</option>
    <option value="😊 Happy">😊Happy</option>
    <option value="😢 Sad">😢Sad</option>
    <option value="😡 Angry">😡Anger</option>
    {/* Add more moods as needed */}
    
  </select>

  </div>
        <form onSubmit={handleSendMessage} className='flex items-center gap-2 flex-1 mx-2'>
          <input
            type='text'
            name='text'
            value={message.text}
            onChange={handleOnChange}
            placeholder='Type a message'
            className='flex-1 py-2 px-4 border rounded-full'
          />
          <button type='button' onClick={handleVoiceInput} className='cursor-pointer hover:text-primary ml-1 mr-1'>
            <FaMicrophone 
            size={23}/>
          </button>
          <button type='submit' className='cursor-pointer hover:text-primary'>
            <IoMdSend 
            size={23}/>
          </button>
        </form>
      </footer>

      {showTerminationOptions && (
        <div className='absolute top-16 right-4 bg-slate-300 border  shadow-lg rounded-3xl m-2'>
          {terminationMessages.map((message, index) => (
            <div
              key={index}
              className='p-2 cursor-pointer hover:bg-gray-100 rounded-3xl '
              onClick={() => handleTerminationOptionClick(message)}
            >
              {message }
            </div>
          ))}
        </div>
      )}
      {/* {loading && <Loading />} */}
    </div>
  );
};

export default MessagePage;
