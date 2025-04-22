import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F3CF57',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  editIcon: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#F3CF57',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#121212',
  },
  groupName: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '500',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    textAlign: 'center',
    width: 200,
  },
  section: {
    marginBottom: 30,
  },
  sectionLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  pickerWrapper: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  picker: {
    color: '#FFD366',
    height: 50,
    paddingHorizontal: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  toggleButtonActive: {
    backgroundColor: '#FFD366',
  },
  toggleText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#000',
  },
  infoButton: {
    marginLeft: 5,
  },
});
