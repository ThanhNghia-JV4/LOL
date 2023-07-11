import { Box } from '@chakra-ui/react';
import { BsFillGrid3X2GapFill } from 'react-icons/bs';
import React from 'react'

const ActionTab = () => {
  return (
    <Box w={"74%"} display={"flex"} flexDirection={"row"} gap={4}>
      <BsFillGrid3X2GapFill />
    </Box>
  )
}

export default ActionTab