import { StatusBar } from 'expo-status-bar';
import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, Alert } from 'react-native';
//El siguiente componente debe ser descargado de la página de expo
import * as ImagePicker from 'expo-image-picker';

//Función que contiene el componente para seleccionar imagenes de la galería
//************************************* */
function ImagePickerChoose(props) {
  const [image, setImage] = useState(null);
  const [photoStatus, setPhotoStatus] = useState('No se ha seleccionado ninguna imágen');
  //controla que los permisos para acceder a la galería hayan sido dados
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
        if (status !== 'granted') {
          alert('Lo sentimos, se necesitan permisos para acceder a la galería');
        }
      }
    })();
  }, []);
  //Selecciona una imágen de manera asincrina desde la galeria y cuando se carga
  //manda a llamar a la función parentCallBack para enviarle el uri al componente padre
  const pickImage = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      setImage(result.uri);
      setPhotoStatus('Listo!, imágen cargada correctamente')
    }
    props.parentCallBack(result)
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Button
        title="Seleccionar imágen"
        onPress={pickImage}
      />
      <Text style={{ fontSize: 12, marginBottom: 20, color: "#888888" }}>{photoStatus}</Text>
      {image && <Image source={{ uri: image }} style={{ width: 300, height: 300 }} />}
    </View>
  );
}


//Clase principal
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      image: '',//obtiene la imagen del componente ImagePickerChoose
    }
  }
  setImageState = (img) => {
    this.setState({
      image: img.uri
    })
  }

  //función para subir imagen al server, en este caso es un servidor en PHP
  uploadImage = async () => {
    let localUri = this.state.image;
    if (localUri == null || localUri == '') {
      Alert.alert('Debe seleccionar una imágen')
    }
    else {
      let filename = localUri.split('/').pop();

      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      let formData = new FormData();
      formData.append('photo', { uri: localUri, name: filename, type });

      return await fetch('https://tu_servidor_remoto/pruebas_fotos/upload_image.php', {
        method: 'POST',
        body: formData,
        header: {
          'content-type': 'multipart/form-data',
        },
      }).then(res => res.json())
        .catch(error => console.error('Error', error))
        .then(response => {
          if (response.status == 1) {
            Alert.alert('Imágen guardada')
          }
          else {
            Alert.alert('No se ha podido guardar la imágen, intentelo de nuevo')

          }
        });
    }

  };
  render() {
    return (
      <View style={styles.container}>
        <Text>Subir imágen a server</Text>
        <ImagePickerChoose parentCallBack={this.setImageState}></ImagePickerChoose>
        <Button
          title="Subir imágen"
          onPress={this.uploadImage}
        />
        <StatusBar style="auto" />
      </View>
    );
  }

}
export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
