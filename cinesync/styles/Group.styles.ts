import { StyleSheet, Dimensions } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#242423',
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    groupBubble: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#ccc',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 10,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
      paddingHorizontal: 30,
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
    },
    input: {
      width: '100%',
      borderBottomWidth: 1,
      borderBottomColor: '#888',
      marginBottom: 20,
      padding: 8,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelBtn: {
      padding: 10,
    },
    submitBtn: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
  });
  