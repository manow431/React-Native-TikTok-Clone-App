import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useCallback } from 'react'
import { Video, ResizeMode } from 'expo-av';
import Colors from '../../Utils/Colors';
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import { useOAuth } from "@clerk/clerk-expo";
import {supabase} from './../../Utils/SupabaseConfig'
WebBrowser.maybeCompleteAuthSession();
export default function LoginScreen() {
  useWarmUpBrowser();
 
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  
  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();
      console.log(createdSessionId)
      if (createdSessionId) {
        setActive({ session: createdSessionId });
        console.log(signUp)
        
        if(signUp)
        {

            const { data, error } = await supabase
            .from('Users')
            .insert([
              { name: signUp?.firstName, 
                email: signUp?.emailAddress,
                username:(signUp?.emailAddress)?.split('@')[0]
              },
            ])
            .select()

            if(data)
            {
              console.log(data);
            }
           
        
        }
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);
  
  return (
    <View style={{flex:1}}>
      <Video
      style={styles.video}
      source={{
        uri:'https://videos.pexels.com/video-files/2025634/2025634-sd_640_360_25fps.mp4'
      }}
      shouldPlay
      resizeMode='cover'
      isLooping={true}
      />
      <View style={{
        display:'flex',
        alignItems:'center',
        paddingTop:100,
        flex:1,
        paddingHorizontal:20,
        backgroundColor:Colors.BACKGROUND_TRASNP
      }}>
          <Text
          style={{
            fontFamily:'outfit-bold',
            color:Colors.WHITE,
            fontSize:35,
          }}
          >Taka Tak</Text>
          <Text
          style={{
            fontFamily:'outfit',
            color:Colors.WHITE,
            fontSize:17,
            textAlign:'center',
            marginTop:15
          }}
          >Utlimate Place to Share your Short Videos with Great Community</Text>

        <TouchableOpacity 
          onPress={onPress}
        style={{
          display:'flex',
          alignItems:'center',
          gap:10,
          flexDirection:'row',
          backgroundColor:Colors.WHITE,
          padding:10,
          paddingHorizontal:55,
          borderRadius:99,
          position:'absolute',
          bottom:150
        }}>
          <Image source={require('./../../../assets/images/google.png')} 
            style={{
              width:30,
              height:30
            }}
          />
          <Text style={{
            fontFamily:'outfit'
          }}>Sign In with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  video:{
    height:'100%',
    width:1000,
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0
  }
})

