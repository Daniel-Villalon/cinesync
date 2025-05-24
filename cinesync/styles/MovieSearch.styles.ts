import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#242423' 
  },
  heading: {
    fontSize: 24,
    color: '#F7EEDB',
    marginHorizontal: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#F7D491',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    color: '#F7EEDB',
  },
  errorText: {
    color: '#FF5555',
    marginTop: 12,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingVertical: 12,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
    color: '#F7EEDB',
  },
  toggleButton: {
    fontSize: 20,
    color: '#F7EEDB',
    marginLeft: 12,
  },
}); 