import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#242423', 
    flex: 1 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#F7EEDB', 
    marginBottom: 10 
  },
  inviteItem: {
    padding: 12,
    backgroundColor: '#333',
    marginBottom: 10,
    borderRadius: 8,
  },
  declineContainer: {
    elevation: 2,
    position: 'absolute',
    right: 10,
    cursor: 'pointer',
    zIndex: 1,
  },
  declineText: {
    color: '#F7EEDB',
  },
  text: { 
    color: '#F7EEDB',
    marginBottom: 4, 
  },
}); 