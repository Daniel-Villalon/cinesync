import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6C343',
    padding: 12,
    borderRadius: 12,
    margin: 10,
    justifyContent: 'space-between',
  },
  iconLeft: {
    paddingRight: 8,
  },
  iconRight: {
    paddingLeft: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  dropdown: {
    backgroundColor: '#F6C343',
    marginHorizontal: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  groupText: {
    fontSize: 16,
    color: '#000',
  },
  pendingButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
  },
  pendingButtonText: {
    color: '#F6C343',
    fontWeight: 'bold',
  },
}); 