import { db } from './db';
import { roles, permissions, rolePermissions, skills } from './schema';

console.log('🌱 Seeding database...');

async function seed() {
  try {
    // Seed system roles
    console.log('  → Creating system roles...');
    await db.insert(roles).values([
      {
        id: 'role_talent',
        name: 'talent',
        scope: 'system',
        description: 'Can participate in missions as talent',
      },
      {
        id: 'role_talent_manager',
        name: 'talent_manager',
        scope: 'system',
        description: 'Can create skill needs and manage missions',
      },
    ]);

    // Seed system permissions
    console.log('  → Creating system permissions...');
    await db.insert(permissions).values([
      {
        id: 'perm_view_talent_pool',
        name: 'view_talent_pool',
        resource: 'talent_pool',
        action: 'view',
        description: 'Can search available talent',
      },
      {
        id: 'perm_create_skill_need',
        name: 'create_skill_need',
        resource: 'skill_need',
        action: 'create',
        description: 'Can post skill requirements',
      },
      {
        id: 'perm_create_mission',
        name: 'create_mission',
        resource: 'mission',
        action: 'create',
        description: 'Can propose missions',
      },
      {
        id: 'perm_approve_mission',
        name: 'approve_mission',
        resource: 'mission',
        action: 'approve',
        description: 'Can approve missions as manager',
      },
      {
        id: 'perm_adjust_credits',
        name: 'adjust_credits',
        resource: 'credits',
        action: 'create',
        description: 'Can manually adjust company credits',
      },
    ]);

    // Map role-permissions
    console.log('  → Mapping role permissions...');
    await db.insert(rolePermissions).values([
      // Talent role
      { roleId: 'role_talent', permissionId: 'perm_view_talent_pool' },
      { roleId: 'role_talent', permissionId: 'perm_create_mission' },

      // Talent Manager role - all permissions
      { roleId: 'role_talent_manager', permissionId: 'perm_view_talent_pool' },
      { roleId: 'role_talent_manager', permissionId: 'perm_create_skill_need' },
      { roleId: 'role_talent_manager', permissionId: 'perm_create_mission' },
      { roleId: 'role_talent_manager', permissionId: 'perm_approve_mission' },
      { roleId: 'role_talent_manager', permissionId: 'perm_adjust_credits' },
    ]);

    // Seed sample skills (from ESCO taxonomy)
    console.log('  → Creating skill taxonomy...');
    await db.insert(skills).values([
      // Engineering
      { name: 'JavaScript', category: 'Engineering', description: 'JavaScript programming language' },
      { name: 'TypeScript', category: 'Engineering', description: 'TypeScript programming language' },
      { name: 'React', category: 'Engineering', description: 'React framework' },
      { name: 'Node.js', category: 'Engineering', description: 'Node.js runtime' },
      { name: 'Python', category: 'Engineering', description: 'Python programming language' },
      { name: 'SQL', category: 'Engineering', description: 'SQL database queries' },
      { name: 'DevOps', category: 'Engineering', description: 'DevOps practices' },

      // Design
      { name: 'UI Design', category: 'Design', description: 'User interface design' },
      { name: 'UX Design', category: 'Design', description: 'User experience design' },
      { name: 'Figma', category: 'Design', description: 'Figma design tool' },
      { name: 'Adobe Creative Suite', category: 'Design', description: 'Adobe design tools' },

      // Business Analysis
      { name: 'Business Analysis', category: 'Business Analysis', description: 'Business analysis skills' },
      {
        name: 'Regulatory Compliance',
        category: 'Business Analysis',
        description: 'Regulatory compliance expertise',
      },
      { name: 'Data Analysis', category: 'Business Analysis', description: 'Data analysis skills' },

      // Marketing
      { name: 'Content Marketing', category: 'Marketing', description: 'Content marketing expertise' },
      { name: 'SEO', category: 'Marketing', description: 'Search engine optimization' },
      { name: 'Social Media Marketing', category: 'Marketing', description: 'Social media marketing' },

      // Finance
      { name: 'Financial Modeling', category: 'Finance', description: 'Financial modeling skills' },
      { name: 'Accounting', category: 'Finance', description: 'Accounting expertise' },
      { name: 'Financial Planning', category: 'Finance', description: 'Financial planning' },
    ]);

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seed();
