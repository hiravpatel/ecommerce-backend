import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { User, UserRole } from 'src/modules/users/data/entities/user.entity';

async function main() {
  await dataSource.initialize();

  try {
    const usersRepository = dataSource.getMongoRepository(User);
    const email = (process.env.ADMIN_EMAIL ?? 'admin@ecommerce.local').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD ?? 'Admin@123456';
    const firstName = process.env.ADMIN_FIRST_NAME ?? 'Platform';
    const lastName = process.env.ADMIN_LAST_NAME ?? 'Admin';
    const phone = process.env.ADMIN_PHONE?.trim() ?? null;

    let admin = await usersRepository.findOneBy({ email });

    if (!admin) {
      admin = usersRepository.create({
        email,
        phone,
        passwordHash: await bcrypt.hash(password, 12),
        firstName,
        lastName,
        role: UserRole.ADMIN,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: Boolean(phone),
        lastLoginAt: null,
      });
    } else {
      admin.passwordHash = await bcrypt.hash(password, 12);
      admin.firstName = firstName;
      admin.lastName = lastName;
      admin.phone = phone;
      admin.role = UserRole.ADMIN;
      admin.isActive = true;
      admin.isEmailVerified = true;
      admin.isPhoneVerified = Boolean(phone);
    }

    await usersRepository.save(admin);

    console.log(`Admin user seeded successfully for ${email}`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
