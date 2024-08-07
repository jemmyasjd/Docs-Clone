import React from 'react'
import {Box} from '@mui/material'
import 'quill/dist/quill.snow.css'
import Quill from 'quill'
import { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import {io} from 'socket.io-client'
import { useParams } from 'react-router-dom'

const Container = styled.div`
background-color: #f5f5f5;`

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
    ['link', 'image', 'video', 'formula'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean']                                         // remove formatting button
  ];

const Editior = () => {

    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    const {id} = useParams()

// setting up the quill editor

    useEffect(() => {
        const quillServer = new Quill('#container' ,{
        theme: 'snow',
        modules: {toolbar: toolbarOptions}
        })

        quillServer.disable()
        quillServer.setText('Loading...')

        setQuill(quillServer)
    }, [])

// setting up the socket connection

    useEffect(() => {
        const socketServer = io('https://docs-clone-back.vercel.app', {
            transports: ['websocket', 'polling'],
        });        
        setSocket(socketServer)
        return () => {
            socketServer.disconnect();
        }
    }, [])

// handling the changes in the editor

    useEffect(()=>{

        if(quill === null || socket === null) return


        const handleChange = (delta,oldDelta, source) => {
            if(source !== 'user') return
            socket && socket.emit('send-changes', delta)
        }

        quill && quill.on('text-change', handleChange) 
        
        return () => {
            quill && quill.off('text-change', handleChange)
        }


    },[quill, socket])

// receiving the changes from the server

    useEffect(()=>{

        if(quill === null || socket === null) return


        const handleChange = (delta) => {
            quill.updateContents(delta)
        }

        socket && socket.on('receive-changes', handleChange) 
        
        return () => {
            socket && socket.off('receive-changes', handleChange)
        }


    },[quill, socket])

// loading the document from the server

    useEffect(() => {

        socket && socket.once('load-document', document => {
            quill && quill.setContents(document)
            quill && quill.enable()
        })

        socket && socket.emit('get-document', id);


    }, [quill,socket ,id])

// saving the document to the server

    useEffect(() => {   
        if (quill === null || socket === null) return

        const interval = setInterval(() => {
            socket && socket.emit('save-document', quill.getContents())
        }, 2000)

        return () => {
            clearInterval(interval)
        }
    }
    , [quill, socket])


  return (
    <Container>
    <Box className="container" id="container"></Box>
    </Container>
  )
}

export default Editior