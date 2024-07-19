import { View, Text, Image, TextInput, KeyboardAvoidingView, ScrollView, TouchableOpacity, ToastAndroid, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import {useRoute,useNavigation} from '@react-navigation/native'
import Colors from '../../Utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { s3bucket } from '../../Utils/S3BucketConfig';
import {supabase} from './../../Utils/SupabaseConfig'
import { useUser } from '@clerk/clerk-expo';
export default function PreviewScreen() {

  const params=useRoute().params;
  const navigation=useNavigation();
  const [description,setDescription]=useState();
  const [videoUrl,setVideoUrl]=useState();
  const [imageUrl,setImageUrl]=useState();
  const [loading,setLoading]=useState(false);
  
  const {user}=useUser();

  useEffect(()=>{
    // console.log(params)
    setImageUrl(null);
    setVideoUrl(null);
  },[]);

  useEffect(()=>{
    imageUrl&&videoUrl&&AddNewDbRecord();
  },[imageUrl&&videoUrl])
 
  const publishHandler=async()=>{
 
   await UploadFileToAws(params.video,'video');
   await UploadFileToAws(params.thumbnail,'image');

  }

  const UploadFileToAws=async(file,type)=>{
    setLoading(true)
    const fileType=file.split('.').pop();//ex: .mp4, .jpg
    const params={
      Bucket:'taka-tak-app',
      Key:`tubeguruji-${Date.now()}.${fileType}`, //Ex. tubeguruji-4745745854.
      Body:await fetch(file).then(resp=>resp.blob()),
      ACL:'public-read',
      ContentType:type=='video'?`video/${fileType}`:`image/${fileType}`
    }
    try{
      const data=await s3bucket.upload(params)
      .promise().then(resp=>{
        console.log("File Upload..");
        console.log("RESP:",resp?.Location);
        setLoading(false)
        type=='video'?setVideoUrl(resp?.Location):setImageUrl(resp?.Location)
      })
    }catch(e)
    {
      setLoading(false)
      console.log(e)
    }
  }

  const AddNewDbRecord=async()=>{
    console.log("HERE");
    setLoading(true)
    const {data,error}=await supabase
    .from('PostList')
    .insert([
    {  videoUrl:videoUrl,
      thumbnail:imageUrl,
      description:description,
      emailRef:user?.primaryEmailAddress.emailAddress}
    ])
    .select();

    if(data)
    {
      console.log(data);
      setLoading(false)
      ToastAndroid.show('Video Pubslied!',ToastAndroid.LONG);
      navigation.navigate('Profile')
    }
    if(error)
    {
      setLoading(false)
    }
    console.log(error)
  }
  return (
    <KeyboardAvoidingView style={{backgroundColor:Colors.WHITE,flex:1}}>
    <ScrollView style={{padding:20,}}>
      <TouchableOpacity 
      onPress={()=>navigation.goBack()}
      style={{display:'flex',flexDirection:'row',gap:10,alignItems:'center'}}>
      <Ionicons name="arrow-back-circle" size={44} color="black" />
      <Text style={{fontFamily:'outfit',fontSize:20}}>Back</Text>
      </TouchableOpacity>
      <View style={{
        alignItems:'center',
        marginTop:100
      }}>
       <Text style={{fontFamily:'outfit-bold',
      fontSize:20}}>Add Details</Text>
      <Image source={{uri:params?.thumbnail}}
        style={{
          width:200,
          height:300,
          borderRadius:15,
          marginTop:15
        }}
      />
      <TextInput
        numberOfLines={3}
        placeholder='Description'
        onChangeText={(value)=>setDescription(value)}
        style={{
          borderWidth:1,
          width:'100%',
          borderRadius:10,
          marginTop:25,
          padding:15,
          borderColor:Colors.BACKGROUND_TRASNP,
          paddingHorizontal:20
        }}
      />
    {loading?
    <ActivityIndicator
    size={'large'}
    style={{
      marginTop:30
    }}
    color={Colors.BLACK}
    />:  
    <TouchableOpacity
    onPress={publishHandler}
    style={{
      backgroundColor:Colors.BLACK,
      padding:10,
      paddingHorizontal:25,
      borderRadius:99,
      marginTop:20
    }}>
     
      <Text style={{color:Colors.WHITE,fontFamily:'outfit'}}>Publish</Text>
    </TouchableOpacity>
  }
    
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}