import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ServiceChip from './ServiceChip';

interface ServiceItem {
  id: string;
  title: string;
  selected: boolean;
}

interface ServiceSelectionProps {
  services: ServiceItem[];
}

export default function ServiceSelection({ services }: ServiceSelectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dịch vụ nhận chuyến</Text>
      <View style={styles.listContainer}>
        {services.map((service) => (
          <ServiceChip
            key={service.id}
            title={service.title}
            selected={service.selected}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    width: '100%',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
});
