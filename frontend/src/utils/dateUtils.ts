export const formatDate = (dateString?: string | null): string => {
  if (!dateString) {
    return 'ไม่ระบุ';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'วันที่ไม่ถูกต้อง';
    }
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'วันที่ไม่ถูกต้อง';
  }
};

export const formatDateOnly = (dateString?: string | null): string => {
  if (!dateString) {
    return 'ไม่ระบุ';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'วันที่ไม่ถูกต้อง';
    }
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'วันที่ไม่ถูกต้อง';
  }
};