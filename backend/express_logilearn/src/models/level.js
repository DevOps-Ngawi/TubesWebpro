const prisma = require('./prisma')

async function getAllLevels() {
    return prisma.levels.findMany({
        include: {
            sections: true
        }
    })
}

async function getLevelsBySection(slugSection) {
    return prisma.levels.findMany({
        where: {
            sections: {
                is: {
                    slug: slugSection
                }
            }
        },
        include: {
            sections: true
        }
    })
}

async function getLevelsBySectionId(slugSection, id) {
    return prisma.levels.findFirst({
        where: {
            sections: {
                is: {
                    slug: slugSection
                }
            },
            id: Number(id)
        },
        include: {
            soals: {
                include: {
                    opsis: true
                }
            }
        }
    })
}

async function getLevelById(id) {
    return prisma.levels.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            soals: {
                include: {
                    opsis: true
                }
            }
        }
    })
}

async function createLevel(idSection, nama) {
    return prisma.levels.create({
        data: {
            id_section: Number(idSection),
            nama: nama
        }
    })
}

async function updateLevel(id, idSection, nama) {
    return prisma.levels.update({
        where: {
            id: Number(id)
        },
        data: {
            id_section: Number(idSection),
            nama: nama
        }
    })
}

async function deleteLevel(id) {
    return prisma.levels.delete({
        where: {
            id: Number(id)
        }
    })
}

async function getSoalsByLevelId(slugSection, idLevel) {
    console.log(`getSoalsByLevelId: slugSection=${slugSection}, idLevel=${idLevel}`);
    
    // First verify the level exists in the section
    const level = await prisma.levels.findFirst({
        where: {
            id: Number(idLevel),
            sections: {
                is: {
                    slug: slugSection
                }
            }
        }
    });

    console.log(`Level found: ${level ? 'yes' : 'no'}`);
    if (!level) {
        console.log(`Level ${idLevel} not found in section ${slugSection}`);
        return [];
    }

    // Then get all soals for this level
    const soals = await prisma.soals.findMany({
        where: {
            id_level: Number(idLevel)
        },
        include: {
            opsis: true
        },
        orderBy: {
            id: 'asc'
        }
    });
    
    console.log(`Found ${soals.length} soals for level ${idLevel}`);
    return soals;
}

async function getSoalByLevelIdAndSoalId(slugSection, idLevel, idSoal) {
    console.log(`getSoalByLevelIdAndSoalId: slugSection=${slugSection}, idLevel=${idLevel}, idSoal=${idSoal}`);
    
    // First verify the level exists in the section
    const level = await prisma.levels.findFirst({
        where: {
            id: Number(idLevel),
            sections: {
                is: {
                    slug: slugSection
                }
            }
        },
        include: {
            sections: {
                select: {
                    id: true,
                    nama: true,
                    slug: true
                }
            }
        }
    });

    console.log(`Level found: ${level ? 'yes' : 'no'}`);
    if (level) {
        console.log(`Level ${idLevel} is in section: id=${level.sections.id}, nama=${level.sections.nama}, slug=${level.sections.slug}`);
    } else {
        // Check if level exists but in different section
        const levelInOtherSection = await prisma.levels.findUnique({
            where: { id: Number(idLevel) },
            include: {
                sections: {
                    select: {
                        id: true,
                        nama: true,
                        slug: true
                    }
                }
            }
        });
        if (levelInOtherSection) {
            console.log(`Level ${idLevel} exists but in section: id=${levelInOtherSection.sections.id}, nama=${levelInOtherSection.sections.nama}, slug=${levelInOtherSection.sections.slug}`);
        } else {
            console.log(`Level ${idLevel} does not exist at all`);
        }
        return null;
    }

    // Then get the specific soal
    const soal = await prisma.soals.findFirst({
        where: {
            id: Number(idSoal),
            id_level: Number(idLevel)
        },
        include: {
            opsis: true
        }
    });
    
    console.log(`Soal found: ${soal ? 'yes' : 'no'}`);
    if (soal) {
        console.log(`Soal id: ${soal.id}, id_level: ${soal.id_level}, tipe: ${soal.tipe}`);
    } else {
        // Check if soal exists but in different level
        const soalInOtherLevel = await prisma.soals.findUnique({
            where: { id: Number(idSoal) }
        });
        if (soalInOtherLevel) {
            console.log(`Soal ${idSoal} exists but in level ${soalInOtherLevel.id_level}, not level ${idLevel}`);
        } else {
            console.log(`Soal ${idSoal} does not exist at all`);
        }
    }
    
    return soal;
}

module.exports = {
    getAllLevels,
    getLevelById,
    getLevelsBySectionId,
    getLevelsBySection,
    createLevel,
    updateLevel,
    deleteLevel,
    getSoalsByLevelId,
    getSoalByLevelIdAndSoalId
}