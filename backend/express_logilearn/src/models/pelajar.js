const prisma = require('./prisma');

const findPelajarStats = async (id_pelajar) => {
  return prisma.attempts.findMany({
    where: {
      id_pelajar,
      skor: { gte: 75 }
    },
    select: { id_level: true }
  });
};

module.exports = { findPelajarStats };